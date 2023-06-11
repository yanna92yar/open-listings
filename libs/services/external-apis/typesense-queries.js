import { Collections } from '../../../types.d.js'

function closeChangeStream(changeStream, timeInMs = 60000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Closing the change stream')
            changeStream.close()
            resolve(2)
        }, timeInMs)
    })
}
/**
 *
 * @param {import('mongodb').ChangeStreamDocument<import('mongodb').Document>} next
 * @param {import('typesense').Client} typesense
 */
async function index(next, typesense) {
    if (next.operationType === 'delete') {
        await typesense.collections(Collections.Listing).documents(next.documentKey._id.toString()).delete()
        // console.log(next.documentKey._id)
    } else if (next.operationType === 'update') {
        let data = JSON.stringify(next.updateDescription.updatedFields)
        await typesense.collections(Collections.Listing).documents(next.documentKey._id.toString()).update(data)
        // console.log(data)
        // @ts-ignore https://jira.mongodb.org/browse/NODE-3626
    } else if (next.fullDocument) {
        // @ts-ignore
        next.fullDocument.id = next.fullDocument['_id']
        // @ts-ignore
        delete next.fullDocument._id
        // @ts-ignore
        let data = JSON.stringify(next.fullDocument)
        await typesense.collections(Collections.Listing).documents().upsert(data)
        // console.log(data)
    }
}

/**
 *
 * @param { import('typesense').Client } typeSense
 * @param { import('mongodb').Db } mongoDB
 */
async function monitorListingsUsingEventEmitter(typeSense, mongoDB, timeInMs = 60000) {
    /** @type { import('mongodb').Collection } */
    const collection = mongoDB.collection(Collections.Listing)

    const changeStream = collection.watch()
    changeStream.on('change', (next) => {
        index(next, typeSense)
    })
    await closeChangeStream(changeStream, timeInMs)
}

async function createSchema(schema, typesense) {
    const collectionsList = await typesense.collections().retrieve()
    let toCreate = collectionsList.find((value) => {
        return value['name'] === schema['name']
    })

    if (!toCreate) {
        await typesense.collections().create(schema)
    }
}

/**
 *
 * @param { Client } typeSense
 * @param { import('mongodb').Db } mongoDB
 */
export default async function (typeSense, mongoDB) {
    const schema = {
        name: Collections.Listing,
        fields: [
            { name: 'title', type: 'string', facet: false },
            { name: 'tags', type: 'string[]', facet: true },
            { name: 'cdesc', type: 'string', facet: false },
            { name: 'parent', type: 'string', facet: true },
            { name: 'granpa', type: 'string', facet: true },
            { name: 'section', type: 'string', facet: true },
        ],
    }
    createSchema(schema, typeSense)

    try {
        await monitorListingsUsingEventEmitter(typeSense, mongoDB)
    } catch (e) {
        console.error(e)
    }
}
