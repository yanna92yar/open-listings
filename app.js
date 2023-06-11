import cors from '@fastify/cors'
import assert from 'assert'
import { config as dotenv } from 'dotenv'
import * as Eta from 'eta'
import fastify_ from 'fastify'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import crypto from 'node:crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import bootstrap from './bootstrap/bootstrap.js'
import { options } from './config/options/_options_.js'
import errorHandler from './libs/decorators/error.js'
import { softVerifyJWT, testVerifyJWT, verifyJWT, wsauth } from './libs/decorators/jwt.js'
import localHandler from './libs/decorators/locale.js'
import paginationHandler from './libs/decorators/pagination.js'
import isSpam from './libs/decorators/spam.js'
import transformer from './libs/decorators/transformer.js'
import isBot from './libs/decorators/visitorsFilter.js'
import { routes } from './libs/routes/_routes_.js'
import Events from './libs/services/event.js'
import { cache } from './libs/services/external-apis/mongo-mem.js'
import RedisAPI from './libs/services/external-apis/redis.js'
import Mailer from './libs/services/mailer.js'
import { plugins } from './_app_.js'
// import { Collections } from './types.d.js'
import { bold, green } from 'colorette'
import { Collections } from './types.d.js'
import { config, NODE_ENV } from './utils.js'



const { corsOptions, helmet, logger, swagger, swaggerUi } = options
const { adminRouter, authRouter, dataRouter, debugRouter, indexRouter, listingsRouter } = routes
const { GracefulServer, fastifyAuth, fastifyCookies, fastifyFlash, fastifyJWT } = plugins
const {
    fastifySchedule,
    fastifySession,
    fastifySwagger,
    fastifySwaggerUi,
    fastifyWebsocket,
    i18nextMiddleware,
    viewsPlugin,
} = plugins
const { fastifyFormbody, fastifyHelmet, fastifyMetrics, fastifyMongodb, fastifyRateLimit, fastifyRedis, fastifyServe } = plugins

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv()

const dbName = 'listings_db'

/**
 * Initialize the fastify app. It could be called many times
 * for NodeJS cluster case
 */
/**
 * build a Fastify instance and run a server or not
 * @param { Boolean } doRun if true run the app on a server
 * @returns { Promise <import('fastify').FastifyInstance> }
 */
async function build(doRun) {
    /** @type  {import('fastify').FastifyInstance & {conf?, mongo?, verifyJWT?, softVerifyJWT?, testVerifyJWT?, wsauth?}} */
    const fastify = fastify_({
        logger: logger(),
        disableRequestLogging: false, // process.env.NODE_ENV === 'production',
        keepAliveTimeout: 10000,
        requestTimeout: 5000,
        // TODO: check if client ip is the right one in spam.js
        trustProxy: true,
    })

    fastify.decorateRequest('fastify', null)
    fastify.addHook('onRequest', async (req) => {
        req['fastify'] = fastify
    })
    const gracefulServer = GracefulServer(fastify.server)
    const log = (s) => {
        fastify.log.info(s)
        console.log(bold(green(s)))
    }
    // TODO: manage open resources (not working !)
    gracefulServer.on(GracefulServer.READY, () => log(GracefulServer.READY))
    gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => log('Server is shutting down'))
    gracefulServer.on(GracefulServer.SHUTDOWN, (error) => log('Server is down because of ' + error.message))

    // TODO: SERVE STATIC CONTENT! LATER PREFERABLY ON A SEPARATE SERVER WITH PROPER PROTECTION
    fastify.register(fastifyServe, { root: path.join(__dirname, 'public') })
    fastify.register(fastifyServe, {
        root: path.join(__dirname, `static/${config('APP_NAME')}`),
        prefix: '/static/',
        decorateReply: false,
    })

    fastify.decorate('conf', (tag) => config(tag))


    fastify.register(fastifySchedule)
    fastify.register(fastifyFormbody)
    fastify.register(fastifyWebsocket)
    fastify.register(fastifyHelmet, helmet())
    // TODO: replace with corsOptions()
    fastify.register(cors, { origin: '*' })
    // fastify.register(fastifyCompress) // Compress all possible types > 1024o
    await fastify.register(fastifyMongodb, {
        forceClose: true,
        url: config('MONGODB_URI', { dbName }),
        ...(NODE_ENV === 'production' && !config('NO_MONGO_CLUSTER') && { replicaSet: 'secluded' }),
    })
    await fastify.register(fastifyRedis, {
        host: config('REDIS_HOST'),
        port: 6379,
        password: config('PASSWORD'),
    })
    // if (NODE_ENV === 'production' && !config('NO_MONGO_CLUSTER')) {
    //     let typeSense = new Typesense.Client(config('TYPESENSE', { TYPESENSE_API_KEY: config('TYPESENSE_API_KEY') }))
    //     typesenseQueries(typeSense, fastify.mongo.db)
    // }

    await fastify.register(fastifyJWT, { secret: fastify.conf('JWT_SECRET') })
    await fastify.register(fastifyAuth)
    // TODO: fastify.after(routes)
    fastify.register(fastifyCookies)
    fastify.register(fastifySession, {
        cookieName: 'session',
        secret: crypto.randomBytes(16).toString('hex'),
        cookie: {
            secure: false,
            maxAge: 2592000000,
        },
    })
    fastify.register(fastifyFlash)

    // Set authentication as soon as possible
    // after necessary plugins have been loaded
    fastify.decorate('verifyJWT', verifyJWT)
    fastify.decorate('softVerifyJWT', softVerifyJWT)
    fastify.decorate('testVerifyJWT', testVerifyJWT)
    fastify.decorate('wsauth', wsauth)
    const happened = new Events(fastify.mongo.db).happened
    fastify.decorate('happened', (type, context, data) => happened(type, context, data))
    // Same db instance all over the all over the app.
    // never close !
    // const { db } = fastify.mongo

    const mongoURL = config('MONGODB_URI', { dbName })

    /*********************************************************************************************** */
    // Seeming heavy so use/register these after starting the app
    // !!TRANSLATIONS !!
    // TODO: ts this
    await i18next
        .use(Backend)
        .use(i18nextMiddleware.LanguageDetector)
        .init({
            backend: {
                loadPath: __dirname + '/data/locales/{{lng}}/common.json',
            },
            fallbackLng: process.env.DEFAULT_LANG,
            preload: ['en-US', 'ar', 'fr', 'de'],
            detection: {
                order: ['cookie'],
                lookupCookie: 'locale',
                caches: ['cookie'],
            },
            // cache: {
            //     enabled: true,
            // },
            // load: 'languageOnly',
            // TODO: what's going on with en and en-US!!
            // debug: NODE_ENV === 'api',
        })
    // @ts-ignore
    fastify.register(i18nextMiddleware.plugin, {
        i18next,
        ignoreRoutes: ['/data/', '/admin/'],
    })

    // @ts-ignore
    fastify.get('/i18n/:locale/', (req, reply) => localHandler(req, reply))
    /*********************************************************************************************** */
    // TODO: find a way to strip very long ejs logging errors
    fastify.register(viewsPlugin, {
        engine: {
            eta: Eta,
        },
        templates: 'templates',
        options: { useWith: true },
    })
    /*********************************************************************************************** */
    // !!PREHANDERS AND HOOKS !!

    // @ts-ignore
    fastify.addHook('onRequest', (req, reply, done) => paginationHandler(req, reply, done))
    fastify.addHook('onRequest', (req, reply, done) => isBot(req, reply, done))
    fastify.addHook('preValidation', (req, reply, done) => transformer(req, reply, done))
    // Mine topK events
    // fastify.addHook('preHandler', miner)

    /*********************************************************************************************** */
    // !!SPAM ASSASSIN !!
    if (NODE_ENV === 'production') fastify.register(fastifyRateLimit, config('PING_LIMITER'))

    // against 404 endpoint ddos
    // fastify.setNotFoundHandler({
    //     preHandler: fastify.rateLimit()
    // }, function (request, reply) {
    //     reply.code(404).send({ hello: 'world' })
    // })

    // TODO: Rate limiter && honeyPot except in process.env === "api"
    fastify.addHook('onRequest', (req, reply, done) => isSpam(req, reply, done))

    // All unhandled errors which are handled by fastify: just send http response
    // @ts-ignore
    fastify.setErrorHandler((error, request, reply) => errorHandler(error, request, reply))

    //  !!Run only on one node!!
    if (NODE_ENV === 'api' /*&& process.env.worker_id === '1'*/) {
        await fastify.register(fastifySwagger, swagger)
        await fastify.register(fastifySwaggerUi, swaggerUi)
    }

    /*********************************************************************************************** */
    // !!REGISTER ROUTES !!
    await (async () => {
        fastify.register(authRouter)
        fastify.register(indexRouter)
        fastify.register(adminRouter, { prefix: 'admin' })
        fastify.register(listingsRouter, { prefix: 'listings' })
        fastify.register(dataRouter, { prefix: 'data' })
        if (NODE_ENV === 'api') fastify.register(debugRouter, { prefix: 'debug' })
    })()

    /*********************************************************************************************** */
    // !!APP AND USER METRICS!!
    // Don't track for api env (API testing)
    const secretPath = process.env.SECRET_PATH
    const promURL = `/${secretPath}/metrics`
    // const adminAuth = fastify.auth([fastify.verifyJWT('admin')])
    // TODO: NODE_ENV === 'production' && 
    if (process.env.worker_id === '1') {
        log(`Metrics accessible from: ${promURL}`)
        fastify.register(fastifyMetrics, { endpoint: promURL /*routeMetrics: { routeBlacklist: promURL }*/ })
    }

    //  !!Run only on one node!!
    if (NODE_ENV === 'api' /*&& process.env.worker_id === '1'*/) {
        log(
            `(Please check localhost:${process.env.PORT || fastify.conf('NODE_PORT')}/documentation it's a nice start`,
        )
        await fastify.ready()
        fastify.swagger()
    }


    const start = async () => {
        try {
            // whatever the env (like heroku)  wants
            const port = process.env.PORT || fastify.conf('NODE_PORT')
            log('The app is accessible on port: ' + port)
            await fastify.listen({ port, host: '0.0.0.0' })
            const mailer = await Mailer.getInstance(mongoURL, dbName)
            if (NODE_ENV === 'production')
                mailer.sendMail({
                    to: fastify.conf('ADMIN_EMAIL'),
                    subject: 'App instance bootstrap',
                    text: 'App instance bootstrapped correctly',
                    html: 'App instance bootstrapped correctly',
                })
            gracefulServer.setReady()
        } catch (err) {
            log(err.message)
            process.exit(1)
        }
    }
    if (doRun) await start()

    /*********************************************************************************************** */
    // !!BOOTSTRAP ENVIRONMENT AND DATA!!

    // Run only on one node
    if (process.env.worker_id === '1') {
        fastify.log.info('Checking environment data once')
        assert(fastify.mongo.db, 'MongoDB connection error')
        assert(fastify.redis, 'Redis DB connection error')
        bootstrap
            .checkEnvironmentData(mongoURL)
            .then(() => {
                prepareData()
            })
            .catch((err) => {
                log('Refusing to start because of ' + err)
                process.exit()
            })
    }
    const seconds = fastify.conf('PIPELINE_KEYWORDS_SECONDS') // a day
    // Use connect method to connect to the Server
    const prepareData = async () => {
        const db = fastify.mongo.db
        const redis = fastify.redis
        const redisAPI = new RedisAPI(redis, db)
        
        if (NODE_ENV === 'production') redisAPI.purgeKeys()
        await redisAPI.cacheIds()
        const colListings = db.collection(Collections.Listing)
        const colUsers = db.collection(Collections.Users)
        // Create indexes
        if (NODE_ENV === 'api') {
            await colListings.deleteMany({})
            await colUsers.deleteMany({})
            bootstrap
                .seedDevelopmentData(db)
                .then(async () => {
                    log('Development data seeding')
                    await bootstrap.createIndexes(db)
                    bootstrap.famousSearches()
                    await bootstrap.fastifyInjects(fastify)
                    bootstrap.registerPipelines(db, fastify.scheduler, seconds)
                    await cache(db)
                })
                .catch((err) => {
                    log('Refusing to start because of ' + err)
                    process.exit()
                })
        } else {
            // TODO: deal with production indexes and map reduce functions
            await bootstrap.createIndexes(db)
            await bootstrap.fastifyInjects(fastify)
            bootstrap.registerPipelines(db, fastify.scheduler, seconds)
            await cache(db)
        }

        // db.on('error', function (error) {
        //     fastify.log.error(error)
        //     // global.mongodb.disconnect()
        // })
    }

    return fastify
}

export default build
