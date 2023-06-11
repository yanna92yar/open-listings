import { ObjectId } from '@fastify/mongodb'
import { Mutex } from 'async-mutex'
import perPage from '../../../config/options/perPage.js'
import { Collections, Sections } from '../../../types.d.js'
import { config } from '../../../utils.js'
import {
    Blog,
    Comment,
    CommentModel,
    Event,
    Hobby,
    ListingModel,
    Market,
    Skill,
    User,
    UserModel,
} from '../../constraints/models.js'
import { default as trans, default as transformers } from '../../constraints/transformers.js'
import * as Strings from '../../services/routines/strings.js'
import { GetListingById, GetListingsSince } from '../external-apis/mongo-protobuff.js'
import { EphemeralData } from '../helpers.js'
import { refreshTopK } from '../miner.js'

// Only to keep quite VSCode TS
ListingModel.a = true
UserModel.isVerified = true
CommentModel.sent = new Date()
// TODO: turn to false
// I decided after reflexion not to consider Redis cache for now. As it is not stable and hard to debug
// Better to deal with initial bugs with Mongo queries then move on with Redis cache.

/**
 * This function returns an ObjectId embedded with a given dateTime
 * Accepts number of days since document was created
 * Author: https://stackoverflow.com/a/8753670/1951298
 * @param {Number} days
 * @return {object}
 */
function getObjectId(days) {
    const yesterday = new Date()
    days = days || 14
    yesterday.setDate(yesterday.getDate() - days)
    const hexSeconds = Math.floor(yesterday / 1000).toString(16)
    return new ObjectId(hexSeconds + '0000000000000000')
}

/**
 *
 * @param {import('mongodb').Db } mongoDB
 * @param { import('ioredis').Redis } redisDB
 * @param { Function } log
 */
export default function (mongoDB, redisDB, log) {
    /** @type { Map<string, Mutex> } */
    let locks = new Map()
    /** @type { import('mongodb').Collection } */
    let collection
    /** @type { import('mongodb').Filter<any> } */
    const baseQuery = { d: false, a: true }
    const baseProjection = { geolocation: 0.0, d: 0.0, a: 0.0 }
    /** @type { import('mongodb').Sort } */
    const baseSort = [['_id']] //'desc'
    /** @type { import('mongodb').CollationOptions } */
    const baseCollation = { locale: 'simple' }

    /**
     * Insert a document into DB
     * @param {ListingModel} elem
     * @return {Promise}
     */
    this.insertListing = async function (elem) {
        log('#### insertListing')
        let listingDoc
        elem.title = Strings.toTitle(elem.title, 30)
        collection = mongoDB.collection(Collections.Listing)
        // https://stackoverflow.com/a/59841285/1951298
        trans['geopoint'](elem)
        switch (elem.section) {
            case Sections.Markets:
                listingDoc = new Market(elem)
                break
            case Sections.Skills:
                listingDoc = new Skill(elem)
                break
            case Sections.Blogs:
                listingDoc = new Blog(elem)
                break
            case Sections.Events:
                listingDoc = new Event(elem)
                break
            case Sections.Hobbies:
                listingDoc = new Hobby(elem)
                break
            default:
                throw new Error('Should not happen')
        }

        const res = collection.insertOne(listingDoc)
        return (await res).insertedId
    }

    /**
     * Insert a document -message into DB
     * @param {CommentModel} elem a JSON representation of a Listing
     * @return {Promise}
     */
    this.insertComment = async function (elem) {
        log('#### insertComment')
        let commentDoc
        elem.thread = Strings.toTitle(elem.thread, 30)
        collection = mongoDB.collection(Collections.Comment)
        commentDoc = new Comment(elem)
        const res = await collection.insertOne(commentDoc)
        return res.acknowledged
    }

    // up-ids cached [doc._id] (only updated documents)
    // glid-@@@@@@@@@@@@ cached document
    // gls-#### cached pages

    // Cache mechanism
    // update doc then add it to up-ids[doc._id] with up = 3
    // 1- getListingById
    // if cached check:
    //  is doc up (up-ids[doc._id] ===1) do nothing proceed happily
    //  is doc up (up-ids[doc._id] ===3 or up-ids[doc._id]===2),
    //      then remove cache
    // get new doc from DB, down up-ids
    //      (up-ids[doc._id] ===3 ==> [doc._id] = 1) or (up-ids[doc._id] ===2 ==> [doc._id] = 0)
    //       and add it to glid-@@@@@@@@@@@@
    // 2- getListingsSince
    // if cached check:
    //  is doc up (up-ids[doc._id] ===2) do nothing proceed happily
    //  is doc up (up-ids[doc._id] ===3 or up-ids[doc._id]===1),
    //      then remove cache
    // get new doc from DB, down up-ids
    //      (up-ids[doc._id] ===3 ==> [doc._id] = 2) or (up-ids[doc._id] ===1 ==> [doc._id] = 0)
    //       and add it to gls-####

    // glid:${id}
    // redis> HSET glid id 3
    // (integer) 1
    // redis> HSET myhash id 2
    // (integer) 1
    // redis> HKEYS myhash
    // 1) "id1"
    // 2) "id2"

    /**
     * Get a document from DB
     * If Admin then get unapproved document
     * @param {String} id Id of a Listing
     * @param {Boolean} isAdmin if the caller is admin
     * @param {String} viewer
     * @return {Promise<Object | undefined>}
     */
    this.getListingById = async function (id, isAdmin, viewer) {
        log('#### getListingById')
        if (!locks.has(id)) locks.set(id, new Mutex())
        // @ts-ignore
        const release = await locks.get(id).acquire()
        const unique = `glid:${id}`
        const canView = (doc) => isAdmin || doc.usr === viewer || (doc['a'] && !doc['d'])

        const cached = await redisDB.exists(unique) // && false
        collection = mongoDB.collection(Collections.Listing)
        // const query = isAdmin ? { a: false } : JSON.parse(JSON.stringify(baseQuery))
        const query = {}
        const projection = { geolocation: 0.0 }
        if (config('REDIS_CACHE') && cached) {
            const upLevel = (await redisDB.hget(`up-ids`, id)) || '1'
            if (upLevel === '1') {
                const buffer = await redisDB.getBuffer(unique)
                let cachedQResult = new GetListingById().decodeBuffer(buffer)
                // log(cachedQResult)
                release()
                if (canView(cachedQResult)) return cachedQResult
                else return
            }
            if (upLevel === '2' || upLevel === '3') await redisDB.del(unique)
        }
        query._id = new ObjectId(id)
        const listingDoc = await collection.findOne(query, { projection: projection })
        // document has been removed from DB or doesn't exist at all

        if (!listingDoc) {
            if (config('REDIS_CACHE')) {
                await redisDB.hdel(`up-ids`, id)
                if (cached) await redisDB.del(unique)
            }
            release()
            return
        }

        if (canView(listingDoc)) {
            // @ts-ignore override _id to its string representation
            listingDoc._id = listingDoc._id.toHexString()
            const buffer = new GetListingById().getBuffer(listingDoc)
            if (config('REDIS_CACHE')) {
                redisDB.setBuffer(unique, buffer, 'EX', 3600)
                const upLevel = (await redisDB.hget(`up-ids`, id)) || '1'
                // log(`current document level ${upLevel}`)
                if (upLevel === '2') await redisDB.hdel(`up-ids`, id)
                if (upLevel === '3') await redisDB.hset(`up-ids`, id, '1')
            }
            release()
            return listingDoc
        } else {
            release()
        }
    }

    /**
     * Get documents created since number of days
     * @param {*} days number of days since document was created
     * @param {*} section which section
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsSince = async function (days, section, pagination) {
        log('#### getListingsSince')
        const unique = `${section || 'index'}-${days}-${pagination.perPage}-${pagination.page}`
        const cached = await redisDB.exists(`gls:${unique}`)
        collection = mongoDB.collection(Collections.Listing)
        const objectId = getObjectId(days)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: objectId }
        if (section) {
            query.section = section
            pagination.perPage = perPage(section)
        } else {
            // sort = [['section']]
            pagination.perPage = perPage()
        }
        // Because cache mechanism is only one to many
        // only deal with pages with section 'index' (most important)
        if (config('REDIS_CACHE') && cached && section === '') {
            const upIds = await redisDB.hkeys(`up-ids`)
            const glsIds = await redisDB.smembers(`gls-ids:${unique}`)
            // get gls-ids:${unique} and intersect with glid-ids
            let refreshed = false
            for (const element of glsIds) {
                const id = element
                if (upIds.indexOf(id) < 0) continue
                const upLevel = (await redisDB.hget(`up-ids`, id)) || '2'
                if (upLevel === '2') continue
                else {
                    if (upLevel === '3') await redisDB.hset(`up-ids`, id, '2')
                    if (upLevel === '1') await redisDB.hdel(`up-ids`, id)
                    await redisDB.del(`gls-ids:${unique}`)
                    refreshed = true
                }
            }

            if (!refreshed) {
                const buffer = await redisDB.getBuffer(`gls:${unique}`)
                return new GetListingsSince().decodeBuffer(buffer)
            }
        }

        let listingsDocs = await paginate(collection.find(query).project(baseProjection).sort(baseSort), pagination)
        // Normally this doesn't happen (consistent UI / no bad doers)
        if (listingsDocs.length === 0) {
            if (config('REDIS_CACHE')) {
                await redisDB.del(`gls:${unique}`)
                await redisDB.del(`gls-ids:${unique}`)
            }
            return { documents: [], count: 0 }
        }
        const count = await collection.countDocuments(query)
        const substring = 100
        listingsDocs.forEach((listingDoc) => {
            listingDoc.desc = listingDoc.desc.substring(0, substring)
            // doc.title = doc.desc.substring(0, Math.round(substring / 2))
            listingDoc._id = listingDoc._id.toHexString()
        })
        // Remove email
        transformers['redacte'](listingsDocs, ['usr'])
        let newQResult = { documents: listingsDocs, count: count }

        if (section !== '') return newQResult
        if (config('REDIS_CACHE')) {
            const buffer = new GetListingsSince().getBuffer(newQResult)
            redisDB.setBuffer(`gls:${unique}`, buffer, 'EX', 1000)
            await redisDB.sadd(
                `gls-ids:${unique}`,
                listingsDocs.map((doc) => doc._id),
            )
        }
        // listingsDocs.forEach((listingDoc) => redisDB.lpush('gls-ids', doc._id))
        return newQResult
    }

    /**
     * Get documents created by a specific user
     * @param {*} user user email
     * @return {Promise}
     */
    this.getListingsByUser = async function (user) {
        log('#### getListingsByUser')
        collection = mongoDB.collection(Collections.Listing)
        const query = {}
        const projection = { geolocation: 0.0 /*d: 0.0, a: 0.0*/ }
        query.usr = user
        const listingsDocs = await collection.find(query).project(projection).sort(baseSort).toArray()
        transformers['toCssClass'](listingsDocs)
        return listingsDocs
    }

    /**
     * Get notification (messages/...) attached to a specific user
     * @param {string} username user email
     * @return {Promise}
     */
    this.getNotificationsByUser = async function (username) {
        log('#### getNotificationsByUser')
        const getComments = async (username) => {
            collection = mongoDB.collection(Collections.Comment)
            const query = { $or: [{ from: username }, { to: username }] }
            const projection = {}
            const sort = ['threadId', 'sent']
            const tmp = await collection.find(query).project(projection).sort(sort).toArray()
            transformers['comment'](tmp, username)
            return tmp
        }

        const getTopicListings = async (username) => {
            collection = mongoDB.collection(Collections.Users)
            const query = {}
            query.username = username
            let topics = await collection.findOne(query)
            if (!topics || !topics['topics']) return []
            // Subscribed-to topics for one user are like
            // { topics: [{type: 'user', topic: 'user1@mail.com'}, {type: 'tag', topic: 'tag1'}] }
            const subsToUsers = topics.filter((topic) => topic['t'] === 'u').map((t) => t['topic'])
            const subsToTags = topics.filter((topic) => topic['t'] === 't').map((t) => t['topic'])
            // Now having the subscribed to topics, get listings in question
            collection = mongoDB.collection(Collections.Listing)
            const query2 = {}
            query2['usr'] = { $in: subsToUsers }
            const tmp1 = await collection.find(query2).project(baseProjection).sort(baseSort).limit(21).toArray()
            const query3 = {}
            query3['tag'] = { $in: subsToTags }
            const tmp2 = await collection.find(query3).project(baseProjection).sort(baseSort).limit(21).toArray()
            return tmp1.concat(tmp2)
        }
        return (await getComments(username)).concat(await getTopicListings(username))
    }

    /**
     *
     * @param {string} username current user who is subscribing
     * @param {('u'|'t')} type either subscribing to a 'user' or to a 'tag'
     * @param {*} topic the user or tag in question
     * @returns
     */
    this.subscribe = async function (username, type, topic) {
        log('#### subscribe')
        const query = {}
        query.username = username
        collection = mongoDB.collection(Collections.Users)
        return await collection.updateOne(query, { $push: { topics: { type, topic } } })
    }

    /**
     * Get user by username
     * @param {string} username user email
     * @return {Promise}
     */
    this.getUserById = async function (username) {
        log('#### getUserById')
        collection = mongoDB.collection(Collections.Users)
        const query = {}
        query.username = username
        return await collection.findOne(query)
    }

    /**
     * Insert a user into DB
     * @param {UserModel} elem a JSON representation of a user
     * @return {Promise}
     */
    this.insertUser = async function (elem) {
        log('#### insertUser')
        let user
        collection = mongoDB.collection(Collections.Users)
        user = new User(elem)
        transformers['redacte'](user, ['password'])
        return await collection.insertOne(user)
    }

    this.updateUser = async function (elem) {
        log('#### updateUser')
        return await mongoDB
            .collection(Collections.Users)
            .updateOne({ _id: new ObjectId(elem._id) }, { $set: elem }, { upsert: false })
    }

    /**
     * Insert a temporary user into DB (ttl)
     * @param {*} tempUser a JSON representation of a user
     * @return {Promise}
     */
    this.insertTmpUser = async function (tempUser) {
        log('#### insertTmpUser')
        // createdAt: ttl index
        tempUser['createdAt'] = new Date()
        collection = mongoDB.collection(Collections.Userstemp)
        const res = await collection.insertOne(tempUser)
        return res.acknowledged
    }

    /**
     * Get temp user by token
     * @param {*} token
     * @return {Promise}
     */
    this.getTmpUserByToken = async function (token) {
        log('#### getTmpUserByToken')
        collection = mongoDB.collection(Collections.Userstemp)
        const query = {}
        query.token = token
        return await collection.findOne(query)
    }

    /**
     * Approximate search based on indexed text fields: title, desc, tags
     * It also feeds topK miner
     * @param {string} phrase sentence to search
     * @param {boolean} exact whether search the exact sentence or separate terms
     * @param {string} division which division
     * @param {string} section which section
     * @param {string} lang which language
     * @return {Promise}
     */
    this.gwoogl = async function (phrase, exact, division, section, lang, pagination) {
        log('#### gwoogl')
        const daysBefore = 100
        collection = mongoDB.collection(Collections.Listing)
        const ObjectId = getObjectId(daysBefore)
        phrase = exact ? `"${phrase.trim()}"` : phrase.trim()
        const query = JSON.parse(JSON.stringify(baseQuery))
        let collation = lang === 'und' ? baseCollation : { locale: lang }
        query.$text = { $search: phrase }
        query._id = { $gt: ObjectId }
        if (lang !== 'und') query.lang = lang
        if (section) query.section = section
        if (division && division !== 'und') query.div = division
        const docs = await paginate(
            collection
                .find(query, { score: { $meta: 'textScore' } })
                .collation(collation)
                .project(baseProjection)
                .sort({ score: { $meta: 'textScore' } }),
            pagination,
        )

        const count = await collection.countDocuments(query)
        const result = { documents: docs, count: count }
        if (count > 3) {
            refreshTopK(phrase)
        }
        let crossLangDocs = []
        if (count < 6 && phrase.indexOf(' ') < 0) {
            let translations = []
            // log(translations)
            for (const [lang, keywords] of Object.entries(translations)) {
                collation = { locale: lang }
                phrase = keywords.join(' ')
                query.$text = { $search: phrase }
                crossLangDocs = await collection
                    .find(query, { score: { $meta: 'textScore' } })
                    .collation(collation)
                    .project(baseProjection)
                    .sort({ score: { $meta: 'textScore' } })
                    .limit(3) // TODO: configuration
                    .toArray()
                // log(crossLangDocs)
                crossLangDocs.forEach((doc) => {
                    doc['crosslang'] = lang
                })
                crossLangDocs = crossLangDocs.concat(crossLangDocs)
            }
        }
        result['crossLangDocs'] = crossLangDocs
        return result
    }

    /**
     * Search tag based on indexed tags field
     * @param {*} tag which tag
     * @param {*} level
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsByTag = async function (tag, level, pagination) {
        log('#### getListingsByTag')
        const daysBefore = 100 // TODO: configuration
        collection = mongoDB.collection(Collections.Listing)
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        switch (level) {
            case 'origin':
                query.tags = tag
                break
            case 'parent':
                query.parent = tag
                break
            case 'granpa':
                query.granpa = tag
                break
            default:
                break
        }
        const docs = await paginate(collection.find(query).project(baseProjection).sort(baseSort), pagination)

        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     * Search tag based on division field
     * @param {*} division which division
     * @param {*} pagination number of pages and listings in each page
     * @return {Promise}
     */
    this.getListingsByDivision = async function (division, pagination) {
        log('#### getListingsByDivision')
        const daysBefore = 100 //TODO: configuration
        collection = mongoDB.collection(Collections.Listing)
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        query.div = division
        const docs = await paginate(collection.find(query).project(baseProjection).sort(baseSort), pagination)
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     * Search based on indexed Geo-spatial field: lat, lng
     * @param {*} latitude
     * @param {*} longitude
     * @param {*} section (should be 'markets' or 'events'.)
     * @return {Promise}
     */
    this.getListingsByGeolocation = async function (latitude, longitude, section, pagination) {
        log('#### getListingsByGeolocation')
        const daysBefore = 100 //TODO: configuration
        collection = mongoDB.collection(Collections.Listing)
        const ObjectId = getObjectId(daysBefore)
        const query = JSON.parse(JSON.stringify(baseQuery))
        query._id = { $gt: ObjectId }
        if (section) query.section = section
        query.geolocation = {
            $geoWithin: {
                $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], 10 / 3963.2], // 10 miles = 16.09344 kilometers
            },
        }
        const docs = await paginate(collection.find(query).project(baseProjection).sort(baseSort), pagination)
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     *
     * @param {*} id id of unique document
     * @param {*} key boolean field to be toggled
     * @param {*} collName
     * @returns updated document
     */
    this.toggleValue = async function (id, key, collName) {
        log('#### toggleValue')
        if (!locks.has(id)) locks.set(id, new Mutex())
        // @ts-ignore
        const release = await locks.get(id).acquire()
        collection = mongoDB.collection(collName)
        const query = {}
        query._id = new ObjectId(id)
        const docs = await collection.find(query, { limit: 1 }).toArray()
        if (!docs) {
            release()
            return
        }
        const newValues = { $set: {} }

        newValues.$set[key] = !docs[0][key]
        const options = { returnOriginal: false }
        const res = await collection.findOneAndUpdate(query, newValues, options)
        if (config('REDIS_CACHE')) await redisDB.hset(`up-ids`, id, '3')
        release()
        const listing = res.value
        transformers['!toCssClass'](listing)
        return listing
    }

    this.autocomplete = async function (keyword) {
        log('#### autocomplete')
        collection = mongoDB.collection(Collections.Words)
        const keywordRgx = new RegExp('^' + keyword, 'i')
        return await collection.find({ _id: keywordRgx }).project({ _id: 1 }).toArray()
    }

    // One day
    // let topSearches = new EphemeralData(86400000)
    // this.topSearches = async function () {
    //     if (topSearches.isSame()) {
    //         return topSearches.data
    //     }
    //     topSearches.reset()
    //     collection = mongoDB.collection(Collections.Words)
    //     topSearches.data = await collection.find({}).project({ _id: 1 }).sort(/* somehow */).limit(10).toArray()
    //     return topSearches.data
    // }

    this.getListingsByKeyword = async function (keyword, pagination) {
        log('#### getListingsByKeyword')
        collection = mongoDB.collection(Collections.Words)
        const result = await collection.findOne({ _id: keyword })
        if (result) {
            const objIds = result.docs
            if (objIds.length === 0) {
                return { documents: [], count: 0 }
            }
            const docs = await paginate(
                mongoDB
                    .collection(Collections.Listing)
                    .find({ _id: { $in: objIds } })
                    .project(baseProjection)
                    .sort(baseSort),
                pagination,
            )

            const count = await collection.countDocuments({
                _id: { $in: objIds },
            })
            return { documents: docs, count: count }
        } else {
            return { documents: [], count: 0 }
        }
    }

    // { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
    // { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
    // { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
    const reformat = (aa) => {
        let res = {}
        let sections = [...new Set(aa.map((a) => a._id.section))]
        let section
        while ((section = sections.pop()) !== undefined) {
            res[section] = aa
                .filter((z) => z._id.section === section)
                .map((l) => {
                    return { count: l.count, tag: l._id.tags }
                })
        }
        return res
    }

    // TODO: three repetitive methods but fine,
    // maybe they evolve differently in future
    // { _id: 'city_1', count: 8 }
    // { _id: 'city_2', count: 7 }
    // { _id: 'city_3', count: 6 }
    // 5 minutes
    let topByDiv = new EphemeralData(300000)
    let topByParentTag = new EphemeralData(300000)
    let topByGranpaTag = new EphemeralData(300000)
    /**
     * Get top listings by division, or by tags
     * parent tag or granpa tag
     * @param {'div' | 'parent' | 'granpa'} context
     * @returns
     */
    this.topBy = async function (context) {
        log('#### topBy')
        /**  @type EphemeralData */
        let variable
        switch (context) {
            case 'div':
                variable = topByDiv
                break
            case 'parent':
                variable = topByParentTag
                break
            case 'granpa':
                variable = topByGranpaTag
                break
            default:
                return []
        }
        if (variable.isSame()) return variable.data
        variable.reset()
        collection = mongoDB.collection(Collections.Listing)
        const pipeline = [
            { $group: { _id: `$${context}`, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]
        const tmp = await collection.aggregate(pipeline).toArray()
        variable.data = tmp.map((a) => {
            return { tag: a._id, count: a.count }
        })
        return variable.data
    }
    // 5 minutes
    let topTags = new EphemeralData(300000)
    this.topTags = async function () {
        log('#### topTags')
        if (topTags.isSame()) {
            return reformat(topTags.data)
        }
        topTags.reset()
        collection = mongoDB.collection(Collections.Listing)
        const pipeline = [
            { $unwind: '$tags' },
            // by section
            {
                $group: {
                    _id: { tags: '$tags', section: '$section' },
                    count: { $sum: 1 },
                },
            },
            // { $group: { "_id": "$tags", "count": { "$sum": 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
        ]
        topTags.data = await collection.aggregate(pipeline).toArray()
        return reformat(topTags.data)
    }

    /**
     * Get documents for approval or general review
     * When admin doing approval, we only need not yet approved listings
     * When he/she is not, he/she is still doing moderation on all items
     * @param {Boolean} approving
     * @return {Promise}
     */
    this.getListingsForModeration = async function (approving) {
        log('#### getListingsForModeration')
        collection = mongoDB.collection(Collections.Listing)
        const query = approving ? { a: false } : {}
        const projection = {
            geolocation: 0.0,
            ...(!approving && { d: 0.0, a: 0.0 }),
            lat: 0.0,
            lng: 0.0,
            div: 0.0,
        }
        // TODO: find a solution to limit number of docs not to block UI
        const limit = approving ? 0 : 200
        const docs = await collection.find(query).project(projection).sort(baseSort).limit(limit).toArray()
        const count = await collection.countDocuments(query)
        return { documents: docs, count: count }
    }

    /**
     * Update a document in DB
     * @param {*} elem a JSON representation of a Listing
     * @param {*} collName
     * @return {Promise}
     */
    this.updateDocument = async function (elem, collName) {
        log('#### updateDocument')
        const id = elem._id
        if (!locks.has(id)) locks.set(id, new Mutex())
        // @ts-ignore
        const release = await locks.get(id).acquire()
        delete elem._id
        const result = await mongoDB
            .collection(collName)
            .updateOne({ _id: new ObjectId(elem._id) }, { $set: elem }, { upsert: false })
        if (config('REDIS_CACHE')) await redisDB.hset(`up-ids`, id, '1')
        release()
        return result
    }

    /**
     * Remove a document in DB
     * @param {*} id An ID of a Listing
     * @param {*} collName
     * @return {Promise}
     */
    this.removeDocument = async function (id, collName) {
        log('#### removeDocument')
        return await mongoDB.collection(collName).deleteOne({ _id: new ObjectId(id) })
    }

    // this.existsDocument = async function (id, collName) {
    //     return await redisDB.exists(`cacheIds:${collName}:${id}`)
    // }

    this.insertAnnouncement = async function (doc) {
        log('#### insertAnnouncement')
        collection = mongoDB.collection(Collections.Announcements)
        const res = await collection.insertOne(doc)
        return res.insertedId
    }
}
/**
 *
 * @param {*} arg0
 * @param {*} pagination
 * @returns
 */
function paginate(arg0, pagination) {
    return arg0
        .skip(pagination.perPage * pagination.page - pagination.perPage)
        .limit(pagination.perPage)
        .toArray()
}
// TODO: it was working before nesting functions inside the `default function (mongoDB, redisDB)`
// it would be great to have again for development environments

// // function traceMethodCalls(obj) {
// //   let handler = {
// //       get(target, propKey, receiver) {
// //           const origMethod = target[propKey]
// //           return function (...args) {
// //               let result = origMethod.apply(this, args)
// //               logger.log({ level: 'info', message: 'MONGO call ' + propKey })
// //               return result
// //           }
// //       }
// //   }
// //   return new Proxy(obj, handler)
// // }

// module.exports = queries // traceMethodCalls(queries)
