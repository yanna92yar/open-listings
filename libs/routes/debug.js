import perPage from '../../config/options/perPage.js'
import { logger } from '../../utils.js'
import queries from '../services/external-apis/mongo-queries.js'

async function routes(fastify) {
    const { db } = fastify.mongo
    const { redis } = fastify
    const QInstance = new queries(db, redis, new logger(fastify).log)
    const queriesMethods = Object.getOwnPropertyNames(QInstance)
    queriesMethods.forEach((url) => {
        fastify.post(`/${url}`, async (request, reply) => {
            const { body } = request
            const params = body ? Object.values(body) : []
            const pagination = { perPage: perPage(), page: 1 }
            let res
            try {
                console.log(`calling /${url} with parameters ${JSON.stringify(params)}`)
                res = await QInstance[url](...params, pagination)
                reply.send({ url: url, data: res })
            } catch (error) {
                reply.send({ url: url, error: error })
            }
        })
    })
}

export default routes
