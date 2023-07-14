import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'
import { NODE_ENV } from '../../utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePath = '../../data/raw/ipsum.txt'
const textContent = fs.readFileSync(path.join(__dirname, filePath)).toString()
let ips = textContent.split('\n')
if (!ips || ips.length < 999) {
    console.log('Refusing to start because ipsum IPs is not fulfilled properly')
    process.exit(1)
}
// Remove first header lines
ips.pop()
let ip
while ((ip = ips.shift()) && ip.indexOf('#') > -1) {
    /* empty */
}
ips = ips.map((line) => line.split('\t')[0])

let blackBucket = {}
let whiteBucket = {}
function isIn(bucket, ip) {
    const intIp = ip.split('.').map(Number)
    let part1, part2, part3, part4
    ;[part1, part2, part3, part4] = intIp
    const thirdDeep = bucket[part1]?.[part2]?.[part3]
    if (!thirdDeep) return false
    return thirdDeep.indexOf(part4) > -1
}
// From node 15.14
// function pushToBucket(bucket, ip) {
//     const intIp = ip.split('.').map(Number)
//     var part1, part2, part3, part4
//     ;[part1, part2, part3, part4] = intIp

//     bucket[part1] ??= {}
//     bucket[part1][part2] ??= {}
//     const deep3 ??= bucket[part1][part2][part3] ??= []
//     if (deep3.indexOf(part4) < 0)
//         deep3.push(part4)
// }
function pushToBucket(bucket, ip) {
    const intIp = ip.split('.').map(Number)
    let part1, part2, part3, part4
    ;[part1, part2, part3, part4] = intIp

    if (!bucket[part1]) bucket[part1] = {}
    if (!bucket[part1][part2]) bucket[part1][part2] = {}
    if (!bucket[part1][part2][part3]) bucket[part1][part2][part3] = []
    if (bucket[part1][part2][part3].indexOf(part4) < 0) bucket[part1][part2][part3].push(part4)
}

// Fill in blackBucket at startup
for (let ip of ips) {
    pushToBucket(blackBucket, ip)
}

// const test1 = isIn(blackBucket, "100.1.108.246")
// const test2 = isIn(blackBucket, "100.1.108.240")
// console.log(`test1: ${test1}, test2: ${test2}`)

// Two checks are performed, one is ultra-fast IP lookup against a local blacklist
// The second hits 'projecthoneypot.org' API
const v4 = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}'
const v4exact = new RegExp(`^${v4}$`)

/**
 * A pre-validation helper particularly for user POST requests
 * @param {Types.Request} req
 * @param {Types.Reply} reply
 * @param {Types.Done} done
 */
function spamFilter(req, reply, done) {
    // TODO: 'req.socket' Does it work ?

    let ip = req.socket.remoteAddress
    if (!ip) {
        reply.send({ msg: 'site is under maintenance' })
        return
    }
    if (NODE_ENV === 'api') {
        done()
        return
    }
    if (!v4exact.test(ip)) {
        req.log.info(`${ip} strange`)
        reply.send({ msg: 'site is under maintenance' })
        return
    }
    if (isIn(whiteBucket, ip)) {
        done()
        return
    }
    // Fast in-memory black list lookup
    if (isIn(blackBucket, ip)) {
        req.log.info(`${ip} blacklist`)
        reply.send({ msg: 'site is under maintenance' })
        return
    }

    done()
}

export default spamFilter
