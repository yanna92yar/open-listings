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
        const [err, listings] = await to(QInstance.getListingsSince(20, '', req.pagination))
        const [err2, topTags] = await to(QInstance.topBy('div'))
        if (err) {
            throw err
        }
        const { page, perPage } = req.pagination
        const data = {
            listings: listings.documents,
            ...(!err2 ? { components: { tags: topTags } } : {}),
            context: Types.Contexts.Index,
            current: page,
            pages: Math.ceil(listings.count / perPage),
            addressPoints: [],
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id, a.section]
        })
        reply.blabla([data, 'index', 'listings'], req)
        return reply
    }
}
