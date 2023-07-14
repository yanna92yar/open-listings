import { NODE_ENV } from '../../utils.js'

/**
 * @param  {import('fastify').FastifyInstance & {conf, mongo, verifyJWT, softVerifyJWT, testVerifyJWT, wsauth}} fastify
 */
export default function authAdapter(fastify) {
    let auth, adminAuth, softAuth
    if (fastify.auth) {
        if (NODE_ENV === 'api') adminAuth = auth = softAuth = fastify.auth([fastify.softVerifyJWT])
        else {
            auth = fastify.auth([fastify.verifyJWT('regular')])
            adminAuth = fastify.auth([fastify.verifyJWT('admin')])
            softAuth = fastify.auth([fastify.softVerifyJWT])
        }
    } else {
        auth = softAuth = (fastify, opts, done) => {
            done(new Error('fastify.auth must be present !'))
        }
    }
    return { auth, adminAuth, softAuth }
}
