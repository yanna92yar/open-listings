// A full database replica based on some collections sub-keys
// Data is replicated on startup and updated in realtime

import { Collections } from '../../../types.d.js'

// Methods must be synchronous and fast
let listings

/**
 * I thought to keep a whole DB cache of IDs in Redis
 * probably to speed lookup for existence of a listing.
 * @param { import('mongodb').Db } mongoDB
 */
export async function cache(mongoDB) {
    if (!mongoDB) return
    console.log('Running MongoDB cache')
    let collection
    // fill in listings
    collection = mongoDB.collection(Collections.Listing)
    const tmp = await collection.find({}).project({ _id: 1.0, usr: 1.0 }).toArray()
    listings = tmp.map((doc) => {
        const id = doc._id.toHexString ? doc._id.toHexString() : doc._id
        return { id, author: doc.usr }
    })
}

export function isAuthor(id, author) {
    return listings.find((l) => l.id === id && l.author === author)
}
