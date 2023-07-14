import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'

export default (fastify) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        // TODO: Verify (keyword exists in params)
        const keyword = req.params.keyword.trim()
        const [err, listings] = await to(QInstance.getListingsByKeyword(keyword, req.pagination))
        if (err) {
            req.log.error(`index/keyword#getListingsByKeyword: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            subtitle: keyword,
            context: Types.Contexts.Index,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        }
        reply.blabla([data, 'index', 'keyword'], req)
        return reply
    }
}
