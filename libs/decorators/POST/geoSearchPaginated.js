import perPage from '../../../config/options/perPage.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import { getFlowSession } from '../flowSessions.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'

export default (fastify) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.Reply} reply
     */
    return async (req, reply) => {
        const page = parseInt(req.params.p) || 1
        const pagination = { page, perPage: perPage(Types.Contexts.Geolocation) }
        let data = { context: Types.Contexts.Geolocation, addressPoints: [], listings: [] }
        let cachedPostBody = getFlowSession(req, '/search/geolocation')
        if (!cachedPostBody) {
            req.log.error(`search#text: no previous cached request`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        let [err, listings] = await to(
            QInstance.getListingsByGeolocation(
                cachedPostBody.lat,
                cachedPostBody.lng,
                cachedPostBody.section,
                pagination,
            ),
        )
        if (err) {
            req.log.error(`search#geolocation: ${err.message}`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        Object.assign(data, {
            section: cachedPostBody.section,
            listings: listings.documents,
            current: pagination.page,
            pages: Math.ceil(listings.count / pagination.perPage),
        })
        reply.view('./pages/listings_parser_forker', data)
        return reply
    }
}
