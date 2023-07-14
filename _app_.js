import fastifyAuth from '@fastify/auth'
import fastifyCompress from '@fastify/compress'
import fastifyCookies from '@fastify/cookie'
import fastifyFlash from '@fastify/flash'
import fastifyFormbody from '@fastify/formbody'
import fastifyHelmet from '@fastify/helmet'
import fastifyJWT from '@fastify/jwt'
import fastifyMongodb from '@fastify/mongodb'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyRedis from '@fastify/redis'
import fastifySchedule from '@fastify/schedule'
import fastifySession from '@fastify/session'
import fastifyServe from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
// import { createRequire } from 'module'
import viewsPlugin from '@fastify/view'
import fastifyWebsocket from '@fastify/websocket'
import GracefulServer from '@gquittet/graceful-server'
import fastifyMetrics from 'fastify-metrics'
import i18nextMiddleware from 'i18next-http-middleware'
// const require = createRequire(import.meta.url)

const plugins = {
    fastifySchedule,
    i18nextMiddleware,
    fastifyCompress,
    fastifyAuth,
    fastifyCookies,
    fastifyFlash,
    fastifyJWT,
    fastifySession,
    fastifySwagger,
    fastifySwaggerUi,
    fastifyWebsocket,
    viewsPlugin,
    fastifyFormbody,
    fastifyHelmet,
    fastifyMongodb,
    fastifyRateLimit,
    fastifyRedis,
    fastifyServe,
    fastifyMetrics,
    GracefulServer
}
export { plugins }

