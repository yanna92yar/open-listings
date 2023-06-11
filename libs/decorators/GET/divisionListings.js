import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
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
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        const division = req.params.division
        const [err, listings] = await to(QInstance.getListingsByDivision(division, req.pagination))
        if (err) {
            req.log.error(`index/division#getListingsByDivision: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: division,
            context: Types.Contexts.Index,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'division'], req)
        return reply
    }
}
