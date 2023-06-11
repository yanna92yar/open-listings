import { Actions } from '../../constraints/constants.js'
import { tagsSubValidation } from '../../services/pipeLine.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

export default (fastify) => {
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.Reply} reply
     */
    return async (req, reply) => {
        /** @Type  */
        const body = req.body
        const section = body.section
        if (!section) {
            req.log.error(`post/listings#tags: no section provided}`)
            reply.send({ error: 'SERVER_ERROR' })
            return reply
        }
        let errors, tagsValid
        try {
            ;({ errors, tagsValid } = tagsSubValidation(req))
        } catch (error) {
            req.log.error(`post/listings#tags: ##########}`)
            reply.send({ error: 'SERVER_ERROR' })
            return reply
        }
        const valid = !errors.length && tagsValid
        if (!valid) {
            req.log.error(`post/listings#tags: ##########}`)
            reply.send({ error: 'POST_ERR' })
            return reply
        } else {
            reply.send({ ok: '' })
            fastify.happened(Actions.subscribe, 'post/listings#tags', { req, reply })
            return reply
        }
    }
}
