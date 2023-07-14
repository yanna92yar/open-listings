import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import { formatAjvToLocals } from '../blabla.js'
import { setFlowSession } from '../flowSessions.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'
import { safeText } from '../../services/external-apis/safe-text.js'

export default (fastify) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.Reply} reply
     */
    return async (req, reply) => {
        let data = { context: Types.Contexts.Gwoogl, addressPoints: [], listings: [], crossLangListings: [] }

        if (req.validationError && req.validationError.validation) {
            const warnings = formatAjvToLocals(req.validationError, req)
            req.log.error(`search#gwoogl: validation error`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: warnings })
            return reply
        }
        setFlowSession(req, '/search/gwoogl')

        /** @type Types.gwooglSchema */
        const body = req.body
        const { additional } = await safeText({ text: body.title_desc, models: ['DetectLanguage'] })
        const lang = additional.language
        let [err, listings] = await to(
            QInstance.gwoogl(body.title_desc, body.exact, body.div_q, body.section, lang, req.pagination),
        )
        if (err) {
            req.log.error(`search#gwoogl: ${err.message}`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        const { page, perPage } = req.pagination
        Object.assign(data, {
            section: body.section,
            listings: listings.documents,
            crossLangListings: listings.crossLangDocs,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        })
        reply.view('./pages/listings_parser_forker', data)
        return reply
    }
}
