// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'
import { Actions } from '../../constraints/constants.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { safeText } from '../../services/external-apis/safe-text.js'
import { absorb, to } from '../../services/routines/code.js'
import * as Crypto from '../../services/routines/crypto.js'
import * as Strings from '../../services/routines/strings.js'

export default (fastify) => {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis, new logger(fastify).log)
    const key = Crypto.passwordDerivedKey(fastify.conf('PASSWORD'))

    /**
     * // TODO: make schema validation for messages
     *
     * @param {Types.RequestExtended} req
     * @param {Types.ReplyExtended} reply
     */
    return async (req, reply) => {
        /** @type Types.MessageSchema */
        const body = req.body

        const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        // TODO: fix messaging system
        let receiver = Crypto.decrypt(key, body.username)
        const [err, elem] = mongoHex.test(body.id || '')
            ? await to(QInstance.getListingById(body.id, false, receiver))
            : ['NOT_FOUND', undefined]
        if (err) {
            req.log.error(`post/sendMessage#getListingById: ${err.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        if (!elem) {
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        if (req.validationError?.validation) {
            reply.blabla([{ data: elem }, 'listing', 'contact'], req)
            return reply
        }

        let stripped

        const { clean, additional } = await safeText({
            text: body.message,
        })
        // body.message = clean
        // body.lang = additional['language']
        // stripped = body.message.replace(/<[^>]*>?/gm, '')
        // body.cmsg = stripped

        const message = {
            to: receiver,
            from: req.params.username,
            sent: new Date(),
            threadId: body.id,
            thread: elem.title,
            message: clean,
            lang: additional['language'],
            cmsg: stripped,
        }
        const [error, acknowledged] = await to(QInstance.insertComment(message))
        absorb(acknowledged)
        if (error) {
            req.log.error(`post/sendMessage#getListingById: ${error.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            return reply
        }
        let data = {}
        elem.email = Crypto.encrypt(key, elem.usr)
        elem.usr = elem.usr ? Strings.initials(elem.usr) : 'YY'
        data = { data: elem, section: elem.section }
        reply.blabla([data, 'listing', 'contact'], req)
        fastify.happened(Actions.send_message, 'listings#sendMessage', { req, reply })
        return reply
    }
}
