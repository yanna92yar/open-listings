import axios from 'axios'
import showdown from 'showdown'
import { Contexts, Sections } from '../../types.d.js'
import { logger } from '../../utils.js'
import getDivisionListings from '../decorators/GET/divisionListings.js'
import getHomepage from '../decorators/GET/homepage.js'
import getKeywordListings from '../decorators/GET/keywordListings.js'
import getTagListings from '../decorators/GET/tagListings.js'
import authAdapter from '../decorators/auth.js'
import blabla from '../decorators/blabla.js'
import queries from '../services/external-apis/mongo-queries.js'
import { EphemeralData } from '../services/helpers.js'
import { to } from '../services/routines/code.js'
// TODO: rethink validation errors: 'request.validationError'

// The function would need to be declared async for return to work.
// Only routes accept next parameter.
async function routes(fastify) {
    /** @type { import('ioredis').Redis } redis */
    const redis = fastify.redis
    const QInstance = new queries(redis, new logger(fastify).log)
    let { softAuth } = authAdapter(fastify)

    // Using reply.blabla instead of regular `reply.view`
    fastify.decorateReply('blabla', blabla)

    fastify.get('/update/:id/', async function (req, reply) {
        await redis.hset(`up-ids`, req.params.id, 3)
        return reply
    })

    // ============== Get home page (=index) ==============
    const homepageHandler = getHomepage(fastify)
    fastify.get('/', { preHandler: softAuth }, homepageHandler)
    // ============== ***************** ==============

    fastify.get('/tags', { preHandler: softAuth }, function (req, reply) {
        reply.blabla([{}, 'tags', 'tags'], req)
        return reply
    })

    // ============== Get tags listings ==============
    const tagListingsHandler = getTagListings(fastify, 'origin')
    fastify.get('/tag/:tag', { preHandler: softAuth }, tagListingsHandler)
    const parentTagListingsHandler = getTagListings(fastify, 'parent')
    fastify.get('/tag/parent/:tag', { preHandler: softAuth }, parentTagListingsHandler)
    const granpaTagListingsHandler = getTagListings(fastify, 'granpa')
    fastify.get('/tag/granpa/:tag', { preHandler: softAuth }, granpaTagListingsHandler)
    // ============== ***************** ==============

    // ============== Get division listings ==============
    const getDivisionHandler = getDivisionListings(fastify)
    fastify.get('/division/:division', { preHandler: softAuth }, getDivisionHandler)
    // ============== ***************** ==============

    // ============== keyword based search listings ==============
    const getKeywordHandler = getKeywordListings(fastify)
    fastify.get('/keyword/:keyword', { preHandler: softAuth }, getKeywordHandler)
    // ============== ***************** ==============

    /* TODO: throttle this and limit requests to > 3 chars */
    fastify.get('/autocomplete/:keyword', async function (req) {
        const keyword = req.params.keyword.trim()
        const [err, keywords] = await to(QInstance.autocomplete(keyword))
        if (err) {
            req.log.error(`index/autocomplete#autocomplete: ${err.message}`)
            return []
            // reply.blabla([{}, 'message', 'SERVER_ERROR'], req)
            // return reply
        }
        return keywords
    })

    /* GET Top listings by tag. */
    fastify.get('/top/tags', async function (req) {
        const [err, topTags] = await to(QInstance.topTags())
        if (err) {
            req.log.error(`index/top#topTags: ${err.message}`)
            return []
        }
        return topTags
    })

    fastify.get('/top/div', async function (req) {
        // const section = req.params.section
        const [err, topTags] = await to(QInstance.topBy('div'))
        if (err) {
            req.log.error(`index/top/div#topByDivision: ${err.message}`)
            return []
        }
        return topTags
    })

    // TODO: not being called in UI yet,
    fastify.get('/top/parent/tags', async function (req) {
        // const section = req.params.section
        const [err, topTags] = await to(QInstance.topBy('parent'))
        if (err) {
            req.log.error(`index/top/parent#topByParentTag: ${err.message}`)
            return []
        }
        return topTags
    })

    fastify.get('/top/granpa/tags', async function (req) {
        // const section = req.params.section
        const [err, topTags] = await to(QInstance.topBy('granpa'))
        if (err) {
            req.log.error(`index/top/granpa#topByGranpaTag: ${err.message}`)
            return []
        }
        return topTags
    })

    /* GET Top listings by tag. */
    ;['markets', 'skills', 'events', 'hobbies', 'meetings'].forEach((section) => {
        fastify.get(`/explore/all-tags-${section}`, { preHandler: softAuth }, async function (req, reply) {
            reply.view(`./pages/all-tags-${section}`, {
                title: 'Explore all tags!',
                context: Contexts.AllTags,
            })
        })
    })

    /* GET Top listings by tag. */
    fastify.get('/explore/tags', { preHandler: softAuth }, async function (req, reply) {
        reply.view('./pages/tags', {
            title: 'Explore all tags!',
        })
    })

    // Blog pages are pages with little server processing
    fastify.get('/categories', { preHandler: softAuth }, function (req, reply) {
        reply.view('./pages/blog', {
            title: 'Categories',
            sections: [
                { id: Sections.Markets, html: req.t('doc.markets') },
                { id: Sections.Skills, html: req.t('doc.skills') },
                { id: Sections.Blogs, html: req.t('doc.blogs') },
            ],
        })
    })

    fastify.get('/about', { preHandler: softAuth }, function (req, reply) {
        reply.view('./pages/blog', {
            title: 'What is Open-listings',
            sections: [
                { id: 'About', html: req.t('doc.about') },
                { id: 'User agreement', html: req.t('doc.agreement') },
            ],
        })
    })

    fastify.get('/how-to', { preHandler: softAuth }, function (req, reply) {
        reply.view('./pages/blog', {
            title: 'How to post on Listings',
            sections: [
                { id: 'User agreement', html: req.t('doc.agreement') },
                { id: 'Login', html: req.t('doc.login') },
                { id: 'Validation', html: req.t('doc.validation') },
            ],
        })
    })

    fastify.get('/policy', { preHandler: softAuth }, function (req, reply) {
        reply.view('./pages/blog', {
            title: 'Terms of usage',
            sections: [
                { id: 'sec1', html: 'bob' },
                { id: 'sec2', html: 'lorem upsom lorem upsom lorem upsom lorem  ' },
                { id: 'sec3', html: 'lorem upsom lorem upsom lorem upsom lorem  '.toUpperCase() },
            ],
        })
    })

    // Some easter-eggs
    // fastify.get('/fennec-fox', function (req, reply) {
    //     const idx = Math.floor(Math.random() * 4) + 1
    //     reply.view('./pages/easter-egg', {
    //         svg: give.SVGs[idx - 1],
    //         style: `easter-egg-${idx}.css`,
    //     })
    // })

    let converter = new showdown.Converter()
    let dailyAnnouncements = new EphemeralData(86400000)
    let github =
        'https://raw.githubusercontent.com/yanna92yar/Open-listings-xx-data/main/data/announcements/fr/announcements.md'
    fastify.get('/announcements', function (req, reply) {
        let listings = []
        if (dailyAnnouncements.isSame()) {
            listings = dailyAnnouncements.data
            return reply.view('./pages/blog', {
                title: 'Announcements',
                intro: req.t('blog.intro'),
                sections: listings,
            })
        }
        dailyAnnouncements.reset()
        axios
            .get(github)
            .then(function (response) {
                // handle success
                let announcements = response.data.split('<hr>').reverse()
                announcements.forEach((announcement) => {
                    let title = announcement.match(/#.+/g).filter((title) => title.indexOf('##') < 0)[0]
                    title = title.replace(/#/g, '')
                    announcement = converter.makeHtml(announcement)
                    listings.push({ id: title, html: announcement })
                })
                dailyAnnouncements.data = listings
                return reply.view('./pages/blog', {
                    title: 'Announcements',
                    intro: req.t('blog.intro'),
                    sections: listings,
                })
            })
            .catch(function (error) {
                // handle error
                console.log(error)
            })
            .then(function () {
                // always executed
            })
    })
}

export default routes
