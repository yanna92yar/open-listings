// @ts-ignore
import { Storage } from '@google-cloud/storage'
import Jimp from 'jimp-compact'
import { createRequire } from 'module'
import path from 'path'
import { format } from 'util'
import { config, logger, NODE_ENV } from '../../../utils.js'
import { Actions } from '../../constraints/constants.js'
import constraints from '../../constraints/constraints.js'
import queries from '../../services/external-apis/mongo-queries.js'
import { listingValidation } from '../../services/pipeLine.js'
import { to } from '../../services/routines/code.js'
import { initials } from '../../services/routines/strings.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'
import { safeText } from '../../services/external-apis/safe-text.js'

const require = createRequire(import.meta.url)
let sharp
try {
    sharp = require('sharp')
} catch (error) {
    console.log('oh no no sharp module. I hope this is not a production environment')
}

let storage, bucket
if (NODE_ENV === 'production' && config('GCLOUD_STORAGE_BUCKET')) {
    storage = new Storage({ keyFilename: './credentials/service-account.json' })
    bucket = storage.bucket(config('GCLOUD_STORAGE_BUCKET'))
}

/**
 * @typedef {{username: string}} Username
 * @param {Types.Request & {params: Username}} req
 * @param {{name: string;small: boolean;}[]} blobNames
 * @param {boolean} isUpload
 * @returns {Types.Listing}
 */
const formatNInsertListing = (req, blobNames, isUpload) => {
    const { body } = req
    let listing = { ...body, d: false, a: false, usr: req.params.username }
    if (isUpload && blobNames.length) {
        const [blobName, blobNameSmall] = blobNames[0].small
            ? [blobNames[1].name, blobNames[0].name]
            : [blobNames[0].name, blobNames[1].name]
        if (blobNameSmall) listing['thum'] = format(`https://storage.googleapis.com/${bucket.name}/${blobNameSmall}`)
        listing['img'] = format(`https://storage.googleapis.com/${bucket.name}/${blobName}`)
    }

    // @ts-ignore
    return listing
}

export default (fastify) => {
    const { redis } = fastify
    const QInstance = new queries(redis, new logger(fastify).log)
    return async (req, reply) => {
        /** @type Types.Listing */
        const body = req.body
        const { method } = req
        const section = body?.section
        if (!body || !section) {
            req.log.error(`post/listings#listing: no section provided}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'])
            return reply
        }
        let errors, tagsValid, geoValid
        try {
            ;({ errors, tagsValid, geoValid } = listingValidation(req))
        } catch (error) {
            req.log.error(`post/listings#listing: ${error.message}`)
            reply.blabla([{}, 'message', 'SERVER_ERROR'])
            return reply
        }
        const valid = !errors.length && tagsValid && geoValid
        if (!valid) {
            req.log.error(`post/listings#listing: ${JSON.stringify(errors)}`)
            reply.blabla([{ errors, section }, 'listings', 'POST_ERR'], req)
            return reply
        } else {
            let stripped

            const { clean, additional } = await safeText({
                text: body.desc,
            })
            body.desc = clean
            body.lang = additional['language']
            stripped = body.desc.replace(/<[^>]*>?/gm, '')
            body.cdesc = stripped

            const { upload } = constraints[config('NODE_ENV')][method][section]
            if (upload && !req.file) {
                req.log.error(`post/listings#listing: file not found`)
                reply.blabla([{ title: 'TODO: blaaaaaaaaaaa' }, 'message', 'SERVER_ERROR'])
                return reply
            }
            if (!upload) {
                const listing = formatNInsertListing(req, [], false)
                const [err, insertedId] = await to(QInstance.insertListing(listing))
                if (err) throw err
                listing['_id'] = insertedId.toHexString ? insertedId.toHexString() : insertedId
                let data = { data: listing, section: listing.section }
                reply.blabla([data, 'listing', 'id'], req)
                fastify.happened(Actions.new_listing, 'post/listings#listing', { req, reply })
                return reply
            } else {
                // If image is not defined for some reason ! I do not know when !!
                // If Multer is being buggy or so
                if (!req.file.buffer) reply.blabla([{ title: 'TODO: blaaaaaaaaaaa' }, 'message', 'SERVER_ERROR'])
                // Upload that damn pictures the original (req.file) and the thumbnail
                // Create a new blob in the bucket and upload the file data.
                // req.file       | Image {
                // req.file       |   fieldname: 'file',
                // req.file       |   originalname: 'cruise.jpg',
                // req.file       |   encoding: '7bit',
                // req.file       |   mimetype: 'image/jpeg',
                // req.file       |   buffer: <Buffer ff d8 ff e1 3d 1e 45 78 69 66 00... 15755535 more bytes>,
                // req.file       |   size: 15755585
                // req.file       | }
                /** @type Promise<{name: string, small:boolean}> */
                let uploadSmallImg
                /** @type Promise<{name: string, small:boolean}> */
                let uploadImg
                let thumbnailBuffer, originalBuffer
                originalBuffer = req.file.buffer
                const { width } = config('IMG_THUMB')
                const suffix = () => Date.now() + '-' + Math.round(Math.random() * 1e9)

                try {
                    if (sharp) {
                        const { width: originalWidth } = await sharp(originalBuffer).metadata()
                        if (originalWidth > 400) {
                            thumbnailBuffer = await sharp(originalBuffer)
                                .resize(Math.round(originalWidth * 0.5))
                                .toBuffer()
                        } else if (originalWidth > 200) {
                            thumbnailBuffer = await sharp(originalBuffer)
                                .resize(width, {
                                    fit: 'inside',
                                })
                                .toBuffer()
                        }
                    } else {
                        const image = await Jimp.read(originalBuffer)
                        image.quality(80).resize(width, Jimp.AUTO)
                        thumbnailBuffer = await image.getBufferAsync(Jimp.AUTO)
                    }
                } catch (error) {
                    req.log.error(`post/listings#listing#Image compression: ${error}`)
                }

                uploadSmallImg = thumbnailBuffer
                    ? new Promise((resolve, reject) => {
                          const filename = suffix() + path.extname(req.file.originalname)
                          const blob = bucket.file(filename)
                          blob.createWriteStream({
                              resumable: false,
                          })
                              .on('finish', () => {
                                  resolve({
                                      name: blob.name,
                                      small: true,
                                  })
                              })
                              .on('error', (err) => {
                                  reject(err)
                              })
                              .end(thumbnailBuffer)
                      })
                    : Promise.resolve({
                          name: '',
                          small: true,
                      })

                uploadImg = new Promise((resolve, reject) => {
                    const filename = suffix() + path.extname(req.file.originalname)
                    const blob = bucket.file(filename)
                    blob.createWriteStream({
                        metadata: {
                            contentType: req.file.mimetype,
                        },
                        resumable: true,
                    })
                        .on('finish', () => {
                            resolve({
                                name: blob.name,
                                small: false,
                            })
                        })
                        .on('error', (err) => {
                            reject(err)
                        })
                        .end(originalBuffer)
                })

                const blobNames = await Promise.all([uploadImg, uploadSmallImg])
                const listing = formatNInsertListing(req, blobNames, true)
                const [err, insertedId] = await to(QInstance.insertListing(listing))
                if (err) throw err
                listing['_id'] = insertedId.toHexString ? insertedId.toHexString() : insertedId
                listing.usr = listing.usr ? initials(listing.usr) : 'YY'
                let data = { data: listing, section: listing.section }
                reply.blabla([data, 'listing', 'id'], req)
                fastify.happened(Actions.new_listing, 'post/listings#listing', { req, reply })
                return reply
            }
        }
    }
}
