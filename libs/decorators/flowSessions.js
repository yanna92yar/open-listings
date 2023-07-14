// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'
/**
 * @param {Types.RequestExtended} req
 * @param {string} context
 */
export function setFlowSession(req, context) {
    // TODO: use redis instead and set a ttl on session['lastQueries']
    const { body } = req
    if (!req.session['lastQueries']) req.session['lastQueries'] = {}
    if (!req.session['lastQueries'][context]) req.session['lastQueries'][context] = {}
    if (body.unique_tab_id) req.session['lastQueries'][context][body.unique_tab_id] = body
}

/**
 *
 * @param {Types.RequestExtended} req
 * @param {string} context
 */
export function getFlowSession(req, context) {
    let cachedPostBody
    const uniqueTabId = req.params.unique_tab_id
    if (
        uniqueTabId &&
        req.session['lastQueries'] &&
        req.session['lastQueries'][context] &&
        req.session['lastQueries'][context][uniqueTabId]
    )
        cachedPostBody = req.session['lastQueries'][context][uniqueTabId]
    return cachedPostBody
}
