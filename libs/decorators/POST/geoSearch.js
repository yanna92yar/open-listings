import { Actions } from '../../constraints/constants.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { to } from '../../services/routines/code.js'
import { formatAjvToLocals } from '../blabla.js'
import { setFlowSession } from '../flowSessions.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { logger } from '../../../utils.js'

export default (fastify) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    /**
     *
     * @param {Types.RequestExtended} req
     * @param {Types.Reply} reply
     */
    return async (req, reply) => {
        let data = { context: Types.Contexts.Geolocation, addressPoints: [], listings: [] }
        if (req.validationError && req.validationError.validation) {
            const warnings = formatAjvToLocals(req.validationError, req)
            req.log.error(`search#geolocation: validation error`)
            reply.statusCode = 500
            reply.send({ error: warnings })
            return reply
        }
        setFlowSession(req, '/search/geolocation')

        /** @type Types.geolocationSchema */
        const body = req.body

        let [err, listings] = await to(
            QInstance.getListingsByGeolocation(body.lat, body.lng, body.section, req.pagination),
        )
        if (err) {
            req.log.error(`search#geolocation: ${err.message}`)
            reply.statusCode = 500
            reply.header('Content-Type', 'application/json; charset=utf-8')
            reply.send({ error: [req.t('generic.error.server')] })
            return reply
        }
        const { page, perPage } = req.pagination
        Object.assign(data, {
            section: body.section,
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage),
        })
        reply.view('./pages/listings_parser_forker', data)
        fastify.happened(Actions.geoSearch, 'search#geolocation', { req, reply })
        return reply
    }
}
