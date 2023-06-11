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
        const section = req.url.split('/')[2].split('?')[0]
        const [err, listings] = await to(QInstance.getListingsSince(100, section, req.pagination))
        if (err) {
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        const { page, perPage } = req.pagination
        const data = {
            section: section,
            context: Types.Contexts.Listings,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
            addressPoints: [],
        }
        data.addressPoints = listings.documents.map((a) => {
            return [a.lat, a.lng, a.title, a._id, a.section]
        })
        reply.blabla([data, 'listings', section], req)
        return reply
    }
}
