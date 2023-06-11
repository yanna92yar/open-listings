// @ts-nocheck
import emailToName from 'email-to-name'
import { config } from '../../utils.js'
import * as Crypto from '../services/routines/crypto.js'

const Trans = {}

Trans['toCssClass'] = (someListing) => {
    someListing.a = someListing.a ? '' : 'nonapproved'
    someListing.d = someListing.d ? 'deactivated' : ''
}

Trans['!toCssClass'] = (someListing) => {
    someListing.a = someListing.a ? 'nonapproved' : ''
    someListing.d = someListing.d ? '' : 'deactivated'
}

Trans['redacte'] = (someListing, fields) => {
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
                        `An error occured calling "Transformer#${propKey}" method with arguments ${JSON.stringify(
                            args[1],
                        )}`,
                    )
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
