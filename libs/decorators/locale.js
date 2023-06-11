// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'
/**
 * Ping this from client side to change default language
 * @param {Types.RequestExtended} req
 * @param {Types.Reply} reply
 */
export default function localHandler(req, reply) {
    // const locale = z.enum(['en', 'ua', 'fr']).parse(req.params.locale)
    const locale = req.params.locale
    reply.cookie('locale', locale, { path: '/' })
    req.i18n.changeLanguage(locale)
    // TODO: confirm this works on https and http for localhost and domain
    if (req.headers.referer) reply.redirect(req.headers.referer)
    else reply.redirect('/')
}
