import Datastore from '@seald-io/nedb'
import { bold, magenta } from 'colorette'
import { config as dotenv } from 'dotenv'
import { createRequire } from 'module'
import path from 'path'
import pupa from 'pupa'
import { fileURLToPath } from 'url'

dotenv()

const require = createRequire(import.meta.url)
const nodeConfig = require('config')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
process.env['NODE_CONFIG_DIR'] = __dirname + '/config/'
process.title = process.env['APP_NAME'] || 'open-listings'

// console.warn(`Loading configuration from ${process.env['NODE_CONFIG_DIR']}`)
// console.warn(`Running on Node environment ?: ${process.env.NODE_ENV}`)

// Incremental is better
export const NODE_ENV = process.env.NODE_ENV

/**
 *
 * @param {string} key
 * @param {any} [secretValues]
 * @returns {string|Object}
 */
export function config(key, secretValues) {
    if (process.env[key]) {
        // if(NODE_ENV === 'api') console.log(`Attempting to access key: ${key}. We are having configuration: ${process.env[key]}`)
        if (process.env[key] === 'true' || process.env[key] === 'false') return process.env[key] === 'true'
        return process.env[key]
    }
    if (!nodeConfig.has(key)) {
        console.error(`Attempting to access key: ${key}, but there is no such configuration !`)
        return
    }
    const stringRes = JSON.stringify(nodeConfig.get(key))
    if (!secretValues) secretValues = {}
    Object.assign(secretValues, process.env)
    const objRes = JSON.parse(pupa(stringRes, secretValues))
    // if(NODE_ENV === 'api') console.log(`Attempting to access key: ${key}. We are having configuration: ${JSON.stringify(objRes)}`)
    return objRes
}

export function logger(fastify) {
    this.log = (s) => {
        if (fastify) fastify.log.info(s)
        console.log(bold(magenta(s)))
    }
}

export const dataStores = {
    _isMongo: process.env['IS_MONGO_DB'] === 'true',
    mongo: null,
}

/**
 * To simply call `db.collection(name)`: Override nedb API to resemble MongoDB one
 * @param {any} mongo
 * @param {string} name
 * // Switch between two types when developing
 * // import('mongodb').Collection
 * @returns {import('@seald-io/nedb').default}
 */
export function collection(mongo, name) {
    if (dataStores[name]) return dataStores[name]
    if (dataStores._isMongo) {
        dataStores[name] = mongo.collection(name)
        return dataStores[name]
    }

    dataStores[name] = new Datastore({
        filename: path.join(__dirname, 'nedb', name + '.db'),
        autoload: true,
        timestampData: true,
    })
    return dataStores[name]
}
