// @ts-nocheck
import emailToName from 'email-to-name'
import { ObjectId } from 'mongodb'
import { config } from '../../utils.js'
import * as Crypto from '../services/routines/crypto.js'

const Trans = {}

/**
 * (can add seconds each time)
 * Creates an ObjectId from the specified datetime value
 * @param {Date | string | number} date datetime value or timestamp in milliseconds
 * @returns
 */
export const objectIdFromDate = (date, seconds) => {
    const t = new Date(date)
    if (seconds) t.setSeconds(t.getSeconds() + seconds)
    const time = new Date(t).getTime() / 1000
    const id = ObjectId.createFromTime(time)
    return id.toHexString()
}

/**
 * Returns the generation date (accurate up to the second) that this ID was generated.
 * @param objectId objectId
 */
export const dateFromObjectId = (objectId) => {
    return new ObjectId(objectId).getTimestamp()
}

// eslint-disable-next-line no-unused-vars
Trans['createTime'] = (obj, seconds) => {
    if (obj['createdAt']) obj['_id'] = objectIdFromDate(new Date(obj['createdAt']))
    else if (obj['_id']) obj['createdAt'] = dateFromObjectId(obj['_id'])
    else obj['_id'] = objectIdFromDate(new Date(), seconds)
}

Trans['toCssClass'] = (someListing) => {
    someListing.a = someListing.a ? '' : 'nonapproved'
    someListing.d = someListing.d ? 'deactivated' : ''
}

Trans['!toCssClass'] = (someListing) => {
    someListing.a = someListing.a ? 'nonapproved' : ''
    someListing.d = someListing.d ? '' : 'deactivated'
}

Trans['redact'] = (someListing, fields) => {
    fields.forEach((field) => {
        delete someListing[field]
    })
}

// Trans['get'] = (someListing, fields) => {
//     fields
//         .filter(key => key in someListing) // line can be removed to make it inclusive
//         .reduce((obj2, key) => (obj2[key] = someListing[key], obj2), {});
// }

const key = Crypto.passwordDerivedKey(config('PASSWORD'))
Trans['comment'] = (someComment, username) => {
    someComment.type = 'comment'
    if (someComment.from === username) {
        someComment['peer'] = emailToName.process(someComment.to)
        someComment['direction'] = 'sender'
    } else {
        someComment['peer'] = emailToName.process(someComment.from)
        someComment['direction'] = 'receiver'
    }
    someComment.from = Crypto.encrypt(key, someComment.from)
    someComment.to = Crypto.encrypt(key, someComment.to)
    someComment.thread = someComment.thread.replace(/ /g, '-')
}

Trans['geopoint'] = (someListing) => {
    if (someListing.lng)
        someListing['geolocation'] = {
            type: 'Point',
            coordinates: [parseFloat(someListing.lng), parseFloat(someListing.lat)],
        }
}

function traceMethodCalls(obj) {
    let handler = {
        get(target, propKey, receiver) {
            receiver // I don't know how to deal with TS fever
            const origMethod = target[propKey]
            return (...args) => {
                try {
                    if (Array.isArray(args[0])) args[0].forEach((arg) => origMethod.call(this, arg, args[1]))
                    else origMethod.call(this, args[0], args[1])
                } catch (error) {
                    console.log(
                        `An error occurred calling "Transformer#${propKey}" method with arguments ${JSON.stringify(
                            args[1],
                        )}`,
                    )
                    console.log(error.message)
                }
            }
        },
    }
    return new Proxy(obj, handler)
}
/**
 * always call functions like this:
 * const ob = {a: true, d: true}
 * Transformer['toCssClass'](ob, 2)
 * or like this
 * Transformer['toCssClass']([ob], 2)
 * arguments must be in this order
 * and correct according to Trans object methods
 */
export default traceMethodCalls(Trans)
