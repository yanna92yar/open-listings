import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import zxcvbnFrPackage from '@zxcvbn-ts/language-fr'
import { Mutex } from 'async-mutex'
// import zxcvbnArPackage from '@zxcvbn-ts/language-ar'
import * as EmailValidator from 'email-validator'
import Multer from 'fastify-multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zxcvbnArTranslations from '../../data/locales/ar/zxcvbnArTranslations.js'
import { config } from '../../utils.js'

const ops = {}

// Initiate Multer Object (a middleware for handling multipart/form-data),
// cloudMulter is used to upload to cloud
// localMulter is used to upload to a folder within the project
// TODO: implement ops.cloudMulter(req, res, function (err) {
//    Error handling: do not accept not existing image file (undefined)
//    or any other uncontrolled error
//    Like here: https://github.com/expressjs/multer#error-handling
// }

ops.cloudMulter = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: config('IMG').size, // no larger than 3mb.
    },
    // Makes req.file undefined in request if not a valid image file.
    fileFilter: (req, file, cb) => {
        // console.log('fileFilter')
        // console.log(req.body)
        if (['image/png', 'image/jpg', 'image/jpeg'].indexOf(file.mimetype) >= 0) {
            cb(null, true)
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false)
        }
    },
}).single('avatar')
ops.localMulter = Multer({ dest: 'static/images/' }).single('avatar')

/**
 * @class
 * Object instantiated with this class are ephemeral. <br>
 * It is not like a generic ttl. It must be #reset() to refresh (only refreshes if necessary)
 * @constructor
 * @public
 */
class EphemeralData {
    constructor(ttl) {
        this.ttl = ttl
        this.lastSeen = Infinity
        this.data = undefined
    }
    /**
     * Reset
     */
    reset() {
        this.lastSeen = Date.now()
    }
    /**
     * isSame
     * @returns
     */
    isSame() {
        return this.data && Date.now() - this.lastSeen < this.ttl
    }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filePath = '../../data/raw/disposable_email_blocklist.txt'
const textContent = fs.readFileSync(path.join(__dirname, filePath)).toString()
let disposableEmails = textContent.split('\n')

ops.isBadEmail = (email) => disposableEmails.indexOf(email.split('@')[1]) > -1 || !EmailValidator.validate(email)

/**
 * Assessment of image quality
 * 1) Brightness: This is relative as a measure, as when brightness is
 *    so high or so low image is of low quality but the opposite is not true
 * @Credit "pixel-average" of author github.com/bencevans
 * @param {*} img
 */
ops.imageIsFine = (img) => {
    let avgR = 0
    let avgG = 0
    let avgB = 0
    // let avgA = 0
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
        avgR += this.bitmap.data[idx + 0]
        avgG += this.bitmap.data[idx + 1]
        avgB += this.bitmap.data[idx + 2]
        // avgA += this.bitmap.data[idx + 3]
    })
    let pixels = img.bitmap.width * img.bitmap.height
    avgR = avgR / pixels
    avgG = avgG / pixels
    avgB = avgB / pixels
    // avgA = avgA / pixels

    let brightness = Math.floor((avgR + avgG + avgB) / 3)
    // let results = {
    //     red: avgR,
    //     green: avgG,
    //     blue: avgB,
    //     alpha: avgA,
    //     brightness: brightness,
    // }
    // Assessment of image quality is experimental and opinionated
    if (brightness < 10 || brightness > 230) return false
    return !(avgR > 240 || avgG > 240 || avgB > 240)
}

const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
        ...zxcvbnFrPackage.dictionary,
    },
}
// set options acts on the main module
zxcvbnOptions.setOptions(options)
let locks = new Map()
ops.isFinePassword = async function isFinePassword(password, lang) {
    const lockId = Math.random()
    if (!locks.has(lockId)) locks.set(lockId, new Mutex())
    // @ts-ignore
    const release = await locks.get(lockId).acquire()
    switch (lang) {
        case 'fr':
            options.translations = zxcvbnFrPackage.translations
            zxcvbnOptions.setOptions(options)
            break
        case 'ar':
            options.translations = zxcvbnArTranslations
            zxcvbnOptions.setOptions(options)
            break
        default:
            break
    }
    let result = zxcvbn(password)
    release()
    return result
}

export { ops, EphemeralData }
