import jwt from 'jsonwebtoken'
import { config } from '../../utils.js'
import { proof } from '../services/routines/crypto.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

const COOKIE_NAME = config('COOKIE_NAME')

/**
 *
 * @param {string[]} roles
 * @returns
 */
function verifyJWT(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles]
    }

    /**
     * @param {Types.RequestExtended} request
     * @param {Types.Reply} reply
     */
    return async function (request, reply) {
        if (!request.cookies) {
            reply.redirect('/')
            return
            // throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
        }
        const cookie = request.cookies[COOKIE_NAME]
        const verificationCallback = (err, data) => {
            if (err) {
                reply.redirect('/login')
                return
                // throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
            }
            if (roles.length && !roles.includes(data.role) && data.role !== 'admin') {
                // user's role is not authorized
                reply.redirect('/login')
                return
                // throw { statusCode: 401, message: 'UNAUTHORIZED_ACCESS' }
            }
            // If logged user has 'admin' role then let go
            // Store username in params (to be used in front). It can be tempted !
            request.params.username = data.username
            // Store username in session (to be used in back). It cannot be tempted !
            request.session.username = data.username
            request.session.proof = proof()
            // request.session.destroy() is in logout route
        }
        jwt.verify(cookie, request.fastify.conf('JWT_SECRET'), verificationCallback)
    }
}

/**
 * Soft verification does not block the page from viewing if user is not logged in !!!!
 * @param {Types.RequestExtended} request
 * @param {*} reply
 * @param {Types.Done} done
 * @returns
 */
function softVerifyJWT(request, reply, done) {
    if (!request.cookies) return false
    const cookie = request.cookies[COOKIE_NAME]
    const verificationCallback = (err, data) => {
        if (err) {
            return done()
        }
        // Store username in params (to be used in front). It can be tempted !
        request.params.username = data.username
        // Store username in session (to be used in back). It cannot be tempted !
        request.session.username = data.username
        request.session.proof = proof()
        // request.session.destroy() is in logout route
        return done()
    }

    jwt.verify(cookie, request.fastify.conf('JWT_SECRET'), verificationCallback)
}

const emails = ['user', 'user2', 'user3', 'user4']
/**
 * Test verification does not block the page from viewing if user is not logged in !!!!
 * Test verification attaches a random testing user to the current session
 * @param {Types.RequestExtended} request
 */
async function testVerifyJWT(request) {
    request.params.username = `${emails[Math.floor(Math.random() * emails.length)]}@example.com`
}

/**
 * JWT verify websocket endoints. This one is synchronous and quick.
 * @param {Types.RequestExtended} request
 * @returns
 */
function wsauth(request) {
    if (!request.cookies) return false
    const cookie = request.cookies[COOKIE_NAME]
    if (!cookie) return false
    try {
        const decoded = jwt.verify(cookie, request.fastify.conf('JWT_SECRET'), () => {})
        // TODO: ts verify
        return decoded['username']
    } catch (ex) {
        console.error(ex.message)
        return false
    }
}

export { verifyJWT, softVerifyJWT, testVerifyJWT, wsauth }
