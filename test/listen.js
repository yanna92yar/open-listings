import got from "got"
import tap from 'tap'
const buildFastify = require('../app')
/** @type {} */
tap.test('GET `/` route', async (t) => {
    t.plan(1)
    buildFastify(false).then(async (fastify) => {
        
        t.teardown(() => fastify.close())
        await fastify.listen(0)
        const {data, response} = await got('http://localhost:' + fastify.server.address().port).json()
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
        // t.same(JSON.parse(body), { hello: 'world' })
        t.has(JSON.parse(data), 'listings', )
    })
})