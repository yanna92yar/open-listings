import perPage from '../../../config/options/perPage.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import { getFlowSession } from '../flowSessions.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'
import { safeText } from '../../services/external-apis/safe-text.js'

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
        const pagination = { page, perPage: perPage(Types.Contexts.Gwoogl) }
        let data = { context: Types.Contexts.Gwoogl, addressPoints: [], listings: [], crossLangListings: [] }
        let cachedPostBody = getFlowSession(req, '/search/gwoogl')
        if (!cachedPostBody) {
            req.log.error(`search#text: no previous cached request`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        const { additional } = await safeText({ text: cachedPostBody.title_desc, models: ['DetectLanguage'] })
        const lang = additional.language
        let [err, listings] = await to(
            QInstance.gwoogl(
                cachedPostBody.title_desc,
                cachedPostBody.exact,
                cachedPostBody.div_q,
                cachedPostBody.section,
                lang,
                pagination,
            ),
        )
        if (err) {
            req.log.error(`search#gwoogl: ${err.message}`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        Object.assign(data, {
            section: cachedPostBody.section,
            listings: listings.documents,
            crossLangListings: listings.crossLangDocs,
            current: pagination.page,
            pages: Math.ceil(listings.count / pagination.perPage),
        })
        reply.view('./pages/listings_parser_forker', data)
        return reply
    }
}
