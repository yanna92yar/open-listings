import multer from 'fastify-multer'
import { Contexts } from '../../types.d.js'
import constraints, { blogsSchema, eventsSchema, marketsSchema, skillsSchema } from '../constraints/constraints.js'

import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'

import getListing from '../decorators/GET/listing.js'
import getSectionListings from '../decorators/GET/sectionListings.js'
import postGeoSearch from '../decorators/POST/geoSearch.js'
import postGeoSearchPaginated from '../decorators/POST/geoSearchPaginated.js'
import postListing from '../decorators/POST/listing.js'
import postMessage from '../decorators/POST/message.js'
import postTags from '../decorators/POST/tags.js'
import postTextSearch from '../decorators/POST/textSearch.js'
import postTextSearchPaginated from '../decorators/POST/textSearchPaginated.js'

import { logger, NODE_ENV } from '../../utils.js'
import inputsValueMapping from '../decorators/transformer.js'
import queries from '../services/external-apis/mongo-queries.js'
import { ops as helpers } from '../services/helpers.js'
import { to } from '../services/routines/code.js'

// TODO: rethink validation errors: 'request.validationError'

// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify) {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis, new logger(fastify).log)
    let { auth, softAuth } = authAdapter(fastify)

    fastify.decorateReply('blabla', blabla)

    fastify.get('/', { preHandler: softAuth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsSince(20, '', req.pagination))
        const [err2, topTags] = await to(QInstance.topTags())
        if (err) {
            req.log.error(`listings#: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            section: '',
            context: Contexts.AllListings,
            listings: listings.documents,
            ...(!err2 ? { components: { tags: topTags } } : {}),
            addressPoints: [],
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'listings', 'listings'], req)
        return reply
    })

    // ============== Get one section listings (~index) ==============
    const getSectionHandler = getSectionListings(fastify)
    fastify.get('/markets', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/events', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/skills', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/blogs', { preHandler: softAuth }, getSectionHandler)
    fastify.get('/hobbies', { preHandler: softAuth }, getSectionHandler)
    // ============== ***************** ==============

    // ============== Get one listing ==============
    /* GET one listing; must not be deactivated. */
    const getListingHandler = getListing(fastify)
    fastify.get('/id/:id/', { preHandler: softAuth }, getListingHandler)
    // ============== ***************** ==============

    // ============== Text based search ==============
    const gwooglSchema = constraints[fastify.conf('NODE_ENV')].POST.queryGwoogl.schema
    /* Query listings not including deactivated */
    // Powered by HTMX on the front.
    const textSearchHandler = postTextSearch(fastify)
    fastify.post(
        '/search/gwoogl',
        { schema: gwooglSchema, attachValidation: true, preHandler: softAuth, preValidation: inputsValueMapping },
        textSearchHandler,
    )
    // paginated query
    // TODO: schema validate p and tab queries
    const textSeachPaginatedHandler = postTextSearchPaginated(fastify)
    fastify.get('/search/gwoogl/:p/:unique_tab_id', textSeachPaginatedHandler)
    // ============== ***************** ==============

    // ============== Geolocation based search ==============
    const geolocationSchema = constraints[fastify.conf('NODE_ENV')].POST.queryGeolocation.schema
    /* Query listings withing a geo-point and radius */
    // Powered by HTMX on the front.
    const geoSeachHandler = postGeoSearch(fastify)
    fastify.post(
        '/search/geolocation',
        { schema: geolocationSchema, attachValidation: true, preHandler: softAuth },
        geoSeachHandler,
    )
    const geoSeachPaginatedHandler = postGeoSearchPaginated(fastify)
    fastify.get('/search/geolocation/:p/:unique_tab_id', geoSeachPaginatedHandler)
    // ============== ***************** ==============

    // ============== Submit a new listing ==============
    const lHandler = postListing(fastify)
    fastify.register(multer.contentParser)
    const upload = NODE_ENV === 'production' ? helpers.cloudMulter : helpers.localMulter
    fastify.post('/markets', { preHandler: [auth, upload], schema: { body: marketsSchema } }, lHandler)
    fastify.post('/skills', { preHandler: [auth], schema: { body: skillsSchema } }, lHandler)
    fastify.post('/blogs', { preHandler: auth, schema: { body: blogsSchema } }, lHandler)
    fastify.post('/events', { preHandler: auth, schema: { body: eventsSchema } }, lHandler)
    // fastify.post('/hobbies', { preHandler: [auth, upload], schema: { body: hobbiesSchema } }, lHandler)
    // ============== ***************** ==============

    // TODO: make validation schemas for tags (in addition to tagsSubValidation processing)
    // ============== Subscribe to a new tag ==============
    const tHandler = postTags(fastify)
    fastify.post('/markets/subscribe', { preHandler: [auth] }, tHandler)
    fastify.post('/skills/subscribe', { preHandler: [auth] }, tHandler)
    fastify.post('/blogs/subscribe', { preHandler: [auth] }, tHandler)
    fastify.post('/events/subscribe', { preHandler: [auth] }, tHandler)
    fastify.post('/hobbies/subscribe', { preHandler: [auth] }, tHandler)
    // ============== ***************** ==============

    const messageSchema = constraints[fastify.conf('NODE_ENV')].POST.message.schema
    const mHandler = postMessage(fastify)
    fastify.post('/sendMessage', { schema: messageSchema, preHandler: auth, attachValidation: true }, mHandler)

    fastify.get('/user', { preHandler: auth }, async function (req, reply) {
        const [err, listings] = await to(QInstance.getListingsByUser(req.params.username))
        if (err) {
            req.log.error(`user#getListingsByUser: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const user = { nickname: req.params.username }
        return reply.view('./pages/listings', {
            user: user,
            title: 'Your listings',
            intro: 'These are your own listings ! You can always verify and deactivate some',
            listings: listings,
            interactive: true,
            context: Contexts.AllListings,
            success: 'Yep, we got some :)',
        })
    })

    fastify.get('/user/notifications', { preHandler: auth }, async function (req, reply) {
        const [err, notifications] = await to(QInstance.getNotificationsByUser(req.params.username))
        if (err) {
            req.log.error(`user#getNotificationsByUser: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const user = { nickname: req.params.username }
        // Thread which are like titles will be used as CSS selectors. So reformat to be a valid CSS selector.
        const threads = [
            ...new Set(
                notifications.map((notif) => {
                    return `${notif.thread.replace(/ /g, '-')}`
                }),
            ),
        ]
        return reply.view('./pages/notifications', {
            user: user,
            title: 'Your notifications',
            intro: 'These are your own notification ! Messages you receive, etc',
            threads: threads,
            notifications: notifications,
            context: Contexts.Messages,
            success: 'Yep, we got some :)',
        })
    })

    fastify.get('/user/toggle/:id', { preHandler: auth }, async function (req, reply) {
        const [err, res] = await to(QInstance.toggleValue(req.params.id, 'd', 'listing'))
        if (err) {
            req.log.error(`user/toggle#toggleValue: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        return reply.view('./partials/sections/card_body', {
            listing: res,
            interactive: true,
        })
    })
}

export default routes
