import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import * as Crypto from '../../services/routines/crypto.js'
import * as Strings from '../../services/routines/strings.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'

export default (fastify) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis, new logger(fastify).log)
    const key = Crypto.passwordDerivedKey(fastify.conf('PASSWORD'))
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        const viewer = req.params.username
        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        const [err, elem] = mongoHex.test(req.params.id)
            ? await to(QInstance.getListingById(req.params.id, false, viewer))
            : ['NOT_FOUND', undefined]
        if (err === 'NOT_FOUND' || !elem) {
            reply.blabla([{}, 'message', 'NOT_FOUND'], req)
            return reply
        }
        if (err) {
            req.log.error(`get/id#getListingById: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }

        // const author = elem.usr
        elem.email = Crypto.encrypt(key, elem.usr)
        elem.usr = elem.usr ? Strings.initials(elem.usr) : 'YY'
        let data = { data: elem, section: elem.section }
        reply.blabla([data, 'listing', 'id'], req)
        return reply
    }
}
