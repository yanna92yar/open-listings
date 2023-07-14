import { describe, it } from '@jest/globals'
import Redis from 'ioredis-mock'
import { beforeEach } from 'node:test'
import { Collections } from '../../../types.d.js'
import { collection, logger } from '../../../utils.js'
import { objectIdFromDate } from '../../constraints/transformers.js'
import mongoQueries from './mongo-queries.js'

// eslint-disable-next-line no-unused-vars
import * as Types from '../../../types.d.js'

const redis = new Redis({
    // `options.data` does not exist in `ioredis`, only `ioredis-mock`
    data: {
        user_next: '3',
        emails: {
            'clark@daily.planet': '1',
            'bruce@wayne.enterprises': '2',
        },
        'user:1': { id: '1', username: 'superman', email: 'clark@daily.planet' },
        'user:2': { id: '2', username: 'batman', email: 'bruce@wayne.enterprises' },
    },
})
const Methods = {
    insertListing: '',
    insertComment: '',
    getListingById: '',
    getListingsSince: '',
    getListingsByUser: '',
    getNotificationsByUser: '',
    subscribe: '',
    getUserById: '',
    insertUser: '',
    updateUser: '',
    insertTmpUser: '',
    getTmpUserByToken: '',
    gwoogl: '',
    getListingsByTag: '',
    getListingsByDivision: '',
    getListingsByGeolocation: '',
    toggleValue: '',
    autocomplete: '',
    getListingsByKeyword: '',
    topBy: '',
    topTags: '',
    getListingsForModeration: '',
    updateDocument: '',
    removeDocument: '',
    insertAnnouncement: '',
}

describe('Queries', () => {
    let id, QInstance
    Object.values(Collections).forEach((collName) => {
        collection(null, collName)
    })
    beforeEach(() => {
        id = objectIdFromDate(new Date())
    })
    it(Methods.getListingById, () => {
        QInstance = new mongoQueries(redis, new logger(null).log)
        QInstance.getListingById(id, true, '---')
    })
    it(Methods.insertListing, async () => {
        const QInstance = new mongoQueries(redis, new logger(null).log)
        /** @type Types.Listing */
        const listings = {
            title: 'title',
            desc: 'description',
            section: 'blogs',
            tags: ['tag1'],
            parent: 'tag1',
            granpa: 'tag1',
            cdesc: 'clean description',
            d: false,
            a: true,
            usr: 'user@mail.com',
            lang: 'und', //check
        }
        // eslint-disable-next-line no-unused-vars
        const id = await QInstance.insertListing(listings)
    })
    it(Methods.insertComment, async () => {
        const QInstance = new mongoQueries(redis, new logger(null).log)
        /** @type Types.Comment */
        const comment = {
            from: 'user@email.com',
            to: 'user@email.com',
            sent: new Date(),
            thread: 'thread',
            threadId: 'threadId',
            message: 'message',
            lang: 'en',
            cmsg: 'message',
        }
        // eslint-disable-next-line no-unused-vars
        const id = await QInstance.insertComment(comment)
    })
})
