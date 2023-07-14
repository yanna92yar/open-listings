import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { config, logger } from '../../utils.js'
import { Actions } from '../constraints/constants.js'
import constraints from '../constraints/constraints.js'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'
import queries from '../services/external-apis/mongo-queries.js'
import { ops as helpers, ops } from '../services/helpers.js'
import Mailer from '../services/mailer.js'
import { absorb, to } from '../services/routines/code.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'
// Encapsulates routes: (Init shared variables and so)
async function routes(fastify) {
    const { redis } = fastify

    const QInstance = new queries(redis, new logger(fastify).log)
    let { auth } = authAdapter(fastify)

    const dbName = 'listings_db'
    const COOKIE_NAME = config('COOKIE_NAME')
    const mongoURL = config('MONGODB_URI', { dbName })

    const loginSchema = constraints[config('NODE_ENV')].POST.login.schema

    // const mailer = Mailer.getInstance(null)
    fastify.decorateReply('blabla', blabla)

    /* GET login page. */
    fastify.get('/login', function (req, reply) {
        reply.blabla([{}, 'login', 'login'], req)
    })

    /* GET subscribe page. */
    fastify.get('/signup', function (req, reply) {
        reply.blabla([{}, 'signup', 'signup'], req)
    })

    /* GET reset page. */
    fastify.get('/reset', function (req, reply) {
        reply.blabla([{}, 'reset', 'reset'], req)
    })

    /**
     * Removes user from cookie and session immediately
     * @param {*} request
     * @param {*} reply
     */
    const kickOut = (request, reply) => {
        reply.setCookie(COOKIE_NAME, {})
        request.session.destroy()
        delete request.params.username
        delete request.params.proof
    }
    /* GET logout. */
    fastify.get('/logout', (request, reply) => {
        kickOut(request, reply)
        request.flash('success', 'Successfully logged out')
        reply.redirect('/')
    })

    fastify.post('/login', { schema: loginSchema, attachValidation: true }, async function (request, reply) {
        if (request.validationError) {
            kickOut(request, reply)
            reply.blabla([{}, 'login', 'VALIDATION_ERROR'], request)
            return reply
        }

        /** @type Types.LoginSchema */
        const body = request.body

        const { username, password } = body
        const user = await QInstance.getUserById(username)
        if (!user) {
            kickOut(request, reply)
            reply.blabla([{}, 'login', 'INCORRECT_CREDENTIALS'], request)
            return reply
        }
        try {
            const isMatch = await bcrypt.compare(password, user.passHash)
            if (!isMatch) {
                kickOut(request, reply)
                reply.blabla([{}, 'login', 'INCORRECT_CREDENTIALS'], request)
                return reply
            } else if (!user.isVerified) {
                reply.blabla([{}, 'login', 'USER_UNVERIFIED'], request)
                return reply
            } else {
                const token = jwt.sign({ username: username, role: user.role }, fastify.conf('JWT_SECRET'))
                reply.setCookie(COOKIE_NAME, token)
                // this.user = username
                if (request.headers.referer) {
                    reply.redirect(request.headers.referer)
                    return reply
                } else {
                    request.flash('success', 'Successfully logged in')
                    reply.redirect('/')
                    return reply
                }
            }
        } catch (err) {
            kickOut(request, reply)
            reply.blabla([{}, 'login', 'SERVER_ERROR'], request)
            return reply
        }
    })

    const signupSchema = constraints[config('NODE_ENV')].POST.signup.schema
    fastify.post('/signup', { schema: signupSchema, attachValidation: true }, async function (request, reply) {
        // basic validation based on Fastify schema
        // if (request.validationError) {
        //     reply.blabla([{}, 'signup', 'VALIDATION_ERROR'], request)
        //     return reply
        // }

        /** @type Types.SignupSchema */
        const body = request.body
        const { username, password, firstName, secondName } = body
        // advanced validation based on other factors
        const passValidation = await ops.isFinePassword(password, request.i18n.language)
        if (passValidation.score <= 2) {
            // TODO: complete with this. Eithe add to blabla decorator or just here.
            // @ts-ignore
            const friendlyMessages = {
                warning: passValidation.feedback.warning,
                suggestions: passValidation.feedback.suggestions,
            }
            reply.blabla([{ ...friendlyMessages }, 'signup', 'VALIDATION_ERROR'], request)
            return reply
        }
        // Always 'regular' by default (except user@mail.com for tests)
        const role = username === config('ADMIN_EMAIL') || username === config('ADMIN_EMAIL2') ? 'admin' : 'regular'
        const isVerified = role === 'admin'
        try {
            const user = await QInstance.getUserById(username)
            if (user) {
                kickOut(request, reply)
                reply.blabla([{}, 'signup', 'EMAIL_TAKEN'], request)
                return reply
                // throw { statusCode: 400, message: 'EMAIL_TAKEN' }
            } else if (helpers.isBadEmail(username)) {
                kickOut(request, reply)
                reply.blabla([{}, 'signup', 'BAD_EMAIL'], request)
                return reply
            } else {
                let passHash = await bcrypt.hash(password, 10)
                // Temporary user to be able to verify property of identity (email)
                let tempUser = {
                    username: username,
                    token: crypto.randomBytes(16).toString('hex'),
                }
                // Actual user but unverified
                const [err, insertedId] = await to(
                    QInstance.insertUser({
                        username,
                        password,
                        firstName,
                        secondName,
                        passHash,
                        isVerified,
                        role,
                    }),
                )
                absorb(insertedId)
                if (err) {
                    kickOut(request, reply)
                    reply.blabla([{}, 'signup', 'VALIDATION_ERROR'], request)
                    return reply
                }

                if (role === 'admin') {
                    reply.redirect('/')
                    return reply
                }
                const mailer = await Mailer.getInstance(mongoURL, dbName)
                mailer.sendCustomMail({
                    to: username,
                    todo: 'signup',
                    req: request,
                    data: { token: tempUser.token, host: config('APIHost') },
                })
                await QInstance.insertTmpUser(tempUser)
                reply.blabla([{}, 'message', 'verification'], request)
                fastify.happened(Actions.subscribe, 'auth/signup', { request, reply })
                return reply
            }
        } catch (err) {
            kickOut(request, reply)
            request.log.error(`signup: ${err.message}`)
            reply.blabla([{}, 'signup', 'SERVER_ERROR'], request)
            return reply
        }
    })

    /* Confirmation of email identity. */
    fastify.get('/confirmation', function (req, reply) {
        reply.blabla([{}, 'confirmation', 'confirmation'], req)
    })
    fastify.post('/confirmation', async function (request, reply) {
        const { token } = request.body
        const tmpUser = await QInstance.getTmpUserByToken(token)
        if (!tmpUser) {
            kickOut(request, reply)
            reply.code(401)
            return new Error('UNAUTHORIZED')
        }
        const user = await QInstance.getUserById(tmpUser.username)
        if (!user) {
            kickOut(request, reply)
            reply.code(401)
            return new Error('INCORRECT_TOKEN')
        }
        if (user.isVerified) {
            reply.code(401)
            return new Error('ALREADY_VERIFIED')
        }
        user.isVerified = true
        await QInstance.updateUser(user)
        reply.redirect('/')
        fastify.happened(Actions.confirmation, 'auth/confirmation', { request, reply })
    })

    /* Reset of email password. */
    const resetSchema = constraints[config('NODE_ENV')].POST.reset.schema
    fastify.post(
        '/reset',
        { schema: resetSchema, preHandler: auth, attachValidation: true },
        async function (request, reply) {
            if (request.validationError) {
                reply.blabla([{}, 'reset', 'VALIDATION_ERROR'], request)
                return reply
            }
            const currentUser = request.params.username
            /**
             * @typedef {object} resetSchema
             * @property {string} [unique_tab_id]
             * @property {string} password
             */
            /** @type resetSchema */
            const body = request.body
            const { password } = body
            const user = await QInstance.getUserById(currentUser)
            // This must never happen really
            if (!user) {
                reply.blabla([{}, 'reset', 'SERVER_ERROR'], request)
                return reply
            }
            try {
                user.passHash = await bcrypt.hash(password, 10)
                const [err, acknowledged] = await to(QInstance.updateUser(user))
                absorb(acknowledged)
                if (err) {
                    reply.blabla([{}, 'reset', 'VALIDATION_ERROR'], request)
                    return reply
                }
                request.flash('success', 'Successfully updated password')
                reply.redirect('/')
                fastify.happened(Actions.reset, 'auth/reset', { request, reply })
                return reply
            } catch (err) {
                request.log.error(`reset: ${err.message}`)
                reply.blabla([{}, 'reset', 'SERVER_ERROR'], request)
                return reply
            }
        },
    )
}

export default routes
