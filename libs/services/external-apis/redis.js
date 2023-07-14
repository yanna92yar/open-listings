import { bold, green } from 'colorette'
import { config } from '../../../utils.js'

/**
 * Purge the whole Redis database at once
 * @param {import("ioredis").Redis} redisDB
 */
function purgeKeys(redisDB) {
    console.log('Redis purge is running')
    // Crashes on Windows with Redis version 2.4.5 on Windows !!
    const stream = redisDB.scanStream({ match: '*' })
    stream.on('data', function (resultKeys) {
        if (resultKeys.length) {
            stream.pause()
            redisDB.unlink(resultKeys).then(() => {
                stream.resume()
            })
        }
    })
    stream.on('end', function () {
        console.log(bold(green('all keys have been visited')))
    })
}

/**
 *
 * @param {import("ioredis").Redis} redisDB
 * @param { any } mongoDB
 */
export default function (redisDB, mongoDB) {
    this.cacheIds = async function () {
        if (!mongoDB) return
        const getIds = async function (collName) {
            /** @type { import("mongodb").Collection } */
            let collection = mongoDB.collection(collName)
            let result = []
            const aggCursor = collection.aggregate([
                { $match: {} },
                { $sort: { _id: 1 } },
                { $group: { _id: null, ids: { $addToSet: '$_id' } } },
            ])
            for await (const doc of aggCursor) {
                result = result.concat(doc.ids.map((id) => (id.toHexString ? id.toHexString() : id)))
            }
            return result
        }
        const listingIds = await getIds('listing')
        const usersIds = await getIds('users')
        const tmpUsersIds = await getIds('userstemp')
        listingIds.forEach((id) => {
            redisDB.hset(`cacheIds:listing`, id, '1')
        })
        usersIds.forEach((id) => {
            redisDB.hset(`cacheIds:users`, id, '1')
        })
        tmpUsersIds.forEach((id) => {
            redisDB.hset(`cacheIds:userstemp`, id, '1')
        })
    }

    this.purgeKeys = function () {
        if (!config('IS_REDIS_CACHE')) return
        // Run once on startup
        purgeKeys(redisDB)
        // Run every 3 hours
        if (process.env.worker_id === '1') setInterval(purgeKeys, 3 * 1000 * 60 * 60, redisDB)
    }
}
