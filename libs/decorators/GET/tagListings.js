import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'

export default (fastify, type) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        const tag = req.params.tag
        const [err, listings] = await to(QInstance.getListingsByTag(tag, type, req.pagination))
        if (err) {
            req.log.error(`index/tag#getListingsByTag: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: tag,
            context: Types.Contexts.Index,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'tags'], req)
        return reply
    }
}
