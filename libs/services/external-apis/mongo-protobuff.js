import path from 'path'
import ProtoBufJs from 'protobufjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const absPath = path.join(__dirname, './protos/getlistingssince.proto')
const root = ProtoBufJs.loadSync(absPath)

const getListingsSince = root.lookupType('MongoQueries.GetListingsSince')
const Listing = root.lookupType('MongoQueries.Listing')

/**
 * @class
 * Proto serializer for a list of Listings
 * @public
 */
class GetListingsSince {
    /**
     *
     * @param {import('mongodb').Document[] | { documents: import('mongodb').Document[]; count: number; }} QResult Mongo documents
     * @returns
     */
    getBuffer(QResult) {
        let err = getListingsSince.verify(QResult)
        if (err) throw Error(err)
        const getListingsSinceObj = getListingsSince.create(QResult)
        return getListingsSince.encode(getListingsSinceObj).finish()
    }
    /**
     *
     * @param {Uint8Array} buffer
     * @returns
     */
    decodeBuffer(buffer) {
        let decodedMessage = getListingsSince.decode(buffer)
        return decodedMessage.toJSON()
    }
}

/**
 * @class
 * Proto serializer for one Listing
 * @public
 */
class GetListingById {
    /**
     *
     * @param {import('mongodb').Document} QResult Mongo document
     * @returns
     */
    getBuffer(QResult) {
        let err = Listing.verify(QResult)
        if (err) throw Error(err)
        const listingObj = Listing.create(QResult)
        return Listing.encode(listingObj).finish()
    }

    /**
     *
     * @param {Uint8Array} buffer
     * @returns
     */
    decodeBuffer(buffer) {
        let decodedMessage = Listing.decode(buffer)
        return decodedMessage.toJSON()
    }
}

export { GetListingsSince, GetListingById }
