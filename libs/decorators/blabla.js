/**
 * THIS DECORATOR IS TO BE REFACTORED !!! IT SEEMS COMPLEXE BECAUSE IT RELIES ON EARLIER VALIDATORS AND THE SPECIFIC ROUTES BEFORE BEING CALLED
 * EACH VALIDATORS AND/OR ROUTE LEAVES DIFFERENT VARIABLES (AJV, ZXCVBN, PIPELINE ETC), THIS IS WHY KEYS IN OBJECTS "CONTEXT" LOOK LIKE A BLACK BOX
 */

import { createRequire } from 'module'
import { config, NODE_ENV } from '../../utils.js'
import constraints from '../constraints/constraints.js'

const require = createRequire(import.meta.url)
const ajvLocalize = {
    en: require('ajv-i18n/localize/en'),
    'en-US': require('ajv-i18n/localize/en'),
    ar: require('ajv-i18n/localize/ar'),
    fr: require('ajv-i18n/localize/fr'),
}

// const COOKIE_NAME = config('COOKIE_NAME')

/**
 * `blabla` is a reply decorator ie: It is a customization of `request.view` of Fastify
 * @param {*} context is like [data, route, kind] where data holds
 * a lot of values to be sent to user
 * Note: `this` is a Fastify object in the context of calling this
 * It's a function inside a request handler so this.request is simply the request object
 */
export default function blabla(context) {
    // (1) GET CURRENT USER IF LOGGED IN
    const user = {}
    if (this.request.params.username) user['nickname'] = this.request.params.username
    Object.assign(context[0], { user })

    // (2) When user is "posting" data, Send back same data again with
    // proper "reduction of passwords or sensitive data"
    // to fill input forms (it helps when there was an error)
    if (this.request.body && this.request.method === 'POST') {
        let formData = JSON.parse(JSON.stringify(this.request.body))
        // Removing password keys
        for (let key in formData) {
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
                // reduct password fields
                if (key.indexOf('pass') > -1) delete formData[key]
            }
        }
        Object.assign(context[0], { formData })
    }

    // (3) localize using i18next for more user friendly messages
    let userFriendlyMsg = {}
    try {
        userFriendlyMsg = localize(context[0], context[1], context[2], this.request, this)
    } catch (err) {
        this.request.log.error(`blabla/localize: ${err.message}`)
    }
    // (4) reconstruct final object holding everything for templates
    const route = context[1]
    const routeConstraints = constraints[config('NODE_ENV')].GET[route]
    const UXConstraints = routeConstraints ? { UXConstraints: routeConstraints } : {}
    const final = { ...userFriendlyMsg, ...UXConstraints }
    // Send JSON for API env
    if (NODE_ENV === 'api') this.send(context[0])
    // Crashes on Windows because of Path
    else this.view(`./pages/${route}`, final)
}
const appName = config('APP_NAME')
/**
 * `localize` uses i18next for more user-friendly messages
 * It maps messages (multilingual) to routes in different contexts
 * @param {*} route abstracts the requested route/resource
 * @param {*} kind abstracts the response route. An EJS view or an indication of the kind/context of response
 * @param {*} data is the additional data to take into account
 * @param {*} req request object to derive localized messages from
 * @param {*} reply reply object to derive flash messages from
 */
function localize(data, route, kind, req, reply) {
    // (1) commonly we have section and subtitle specified
    // these are used for custom messages like
    // Hey user, welcome to "market" page
    const { section, subtitle } = data
    const sharedData = {
        section,
        subtitle,
        app_name: appName,
        returnObjects: true,
    }
    // TODO: handle errors here !
    // a translation could easily be missing !
    // (3) Some announcements (news) the admin pushes for all pages.
    data['announcements'] = req.t(`announcements`, { returnObjects: true, app_name: appName })
    // (4) Actual translation depending on route and its kind, customized by other values (section, subtitle, etc)
    const userFriendlyMsg = req.t(`${route}.${kind}`, sharedData)

    // Reformat a little user friendly messages to have [[[brackets]]] in development environments UI
    //
    //     Object.keys(userFriendlyMsg).forEach((key) => {
    //         if (key !== 'success' && key !== 'error') userFriendlyMsg[key] = `[[[${userFriendlyMsg[key]}]]]`
    //     })

    // The following gets back flashed success or failure messages
    // added in the current request lifecycle (here for ex in `pipeline#listingValidation`)
    // It does not work when session is not yet created! (It works only for logged in users)
    const getOneFlash = (key) => (reply.flash(key) && reply.flash(key).length ? reply.flash(key)[0] : [])
    try {
        userFriendlyMsg['success'] = userFriendlyMsg['success'] || getOneFlash('success')
        userFriendlyMsg['error'] = userFriendlyMsg['error'] || getOneFlash('error')
    } catch (error) {
        req.log.error(`blabla/localize/flash: ${error.message}`)
    }
    // Internationalize and reformat (flattening) of AJV validation errors to send to client
    let warnings = []
    let suggestions = []
    warnings = formatAjvToLocals(req.validationError, req)

    // zxcvbn errors (only in signup router)
    if (route === 'signup')
        if (data.warning || data.suggestions?.length) {
            warnings.push(data.warning)
            suggestions = suggestions.concat(data.suggestions)
        }
    // Concatenate all errors:
    // warning: which are errors generated priore to calling blabla:
    //     a) `pipeline#listingValidation`: data.errors
    //     b) AJV: warnings
    //     c) ZXCVBN: warnings
    //     d) `error` generated in `common.json` namespace
    // back in `userFriendlyMsg.error`
    data.errors = [data.errors].flat().filter(Boolean)
    if (userFriendlyMsg.error || data.errors.length || warnings.length) {
        userFriendlyMsg.error = [...warnings, ...data.errors, userFriendlyMsg.error].filter(Boolean)
    } else userFriendlyMsg.error = []
    // TODO: Add suggestions to toasy on UI
    userFriendlyMsg.suggestions = suggestions.filter(Boolean)
    userFriendlyMsg['meta'] = userFriendlyMsg['intro'] ? userFriendlyMsg['intro'] : ''
    return Object.assign(userFriendlyMsg, data)
}

export function formatAjvToLocals(validationError, request) {
    if (validationError?.validation) {
        const lang = ['en', 'en-US', 'fr', 'ar'].indexOf(request.locale) > -1 ? request.locale : 'en'
        ajvLocalize[lang](request.validationError.validation)
        let warnings = request.validationError.validation.map((err) => `"${err.instancePath || '****'}" ${err.message}`)
        return warnings
    } else return []
}
/**
 * Examples
 * {post, get}('listings/^\/(markets|skills|blogs)/') => 'listings.markets'
 * post('listings/gwoogl') => 'listings.gwoogl' or 'listings.not found' or 'listings.SERVER_ERROR'
 * {post, get}('listings/id/:id/') => 'listing.id' or 'listing.not found' or 'listing.SERVER_ERROR'
 * get('listings/tags') => 'tags.tags'
 */
