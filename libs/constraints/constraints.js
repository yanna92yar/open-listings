// TODO: add defaults to all optional keys !!!
// Constraints to ease code complexity. These constraints reflect
// which operations to run on any endpoint on any environment
import S from 'fluent-json-schema'
import { Sections } from '../../types.d.js'
import { config } from '../../utils.js'
import { fontFamilies, illustrations } from './hallux.js'
const TAG_HARD_SIZE_LIMIT = config('TAG_HARD_SIZE_LIMIT')

// TODO: make a regex to match generateUuid() value for "unique_tab_id" inputs
// function generateUuid() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         let r = Math.random()*16|0, v = c === 'x' ? r : ((r&0x3)|0x8);
//         return v.toString(16);
//     });
// }

// TODO: one single format, revise format on client side
const toDay = () => {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    return yyyy + '/' + mm + '/' + dd
}
// const d = new Date(yyyy, mm-1(!!!!), dd, 0, 0, 0, 0)

const login = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('password', S.string().minLength(8).maxLength(40))
    .required(['username', 'password'])
const loginSchema = {
    body: login,
}

const signup = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('password', S.string().minLength(4).maxLength(40))
    .prop('firstName', S.string().minLength(2).maxLength(40))
    .prop('secondName', S.string().minLength(2).maxLength(40))
    .required(['username', 'password', 'firstName', 'secondName'])
const signupSchema = {
    body: signup,
}

const reset = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('password', S.string().minLength(8).maxLength(40))
    .required(['username', 'password'])
const resetSchema = {
    body: reset,
}

const gwoogl = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title_desc', S.string().minLength(3).maxLength(100))
    .required()
    .prop('exact', S.boolean().default(false))
    .prop('div_q', S.anyOf([S.string().minLength(3).maxLength(40), S.string().const('')])) // HTML default an empty input as '' so it needs to be transformed
    .prop('since', S.string().format(S.FORMATS.DATE))
    .prop(
        'section',
        S.string().enum([Sections.Markets, Sections.Skills, Sections.Hobbies, Sections.Events, Sections.Blogs]),
    )
    .required()
const gwooglSchema = {
    body: gwoogl,
}

const geolocation = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('section', S.string().enum([Sections.Markets, Sections.Events]))
    .required(['lat', 'lng', 'section'])
const geolocationSchema = {
    body: geolocation,
}
export const marketsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(10).maxLength(5000).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('offer', S.boolean().default(false))
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('div', S.string().minLength(3).maxLength(40))
    .prop('section', S.string().enum([Sections.Markets]).required())

const marketsSchema_ = () => {
    return {
        called: false,
        def: marketsSchema,
    }
}

const HEX_WEB_COLOR_PATTERN = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/i
export const skillsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(10).maxLength(5000).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('offer', S.boolean().default(false))
    .prop('section', S.string().enum([Sections.Skills]).required())
    .prop('font', S.string().enum(fontFamilies))
    .prop('undraw', S.string().enum(illustrations))
    .prop('color', S.string().pattern(HEX_WEB_COLOR_PATTERN))
    .prop('img_radio', S.string().required())
const skillsSchema_ = () => {
    return {
        called: false,
        def: skillsSchema,
    }
}

export const blogsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(10).maxLength(5000).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('offer', S.boolean().default(false))
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('div', S.string().minLength(3).maxLength(40))
    .prop('section', S.string().enum([Sections.Blogs]).required())
const blogsSchema_ = () => {
    return {
        called: false,
        def: blogsSchema,
    }
}

export const eventsSchema = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('title', S.string().minLength(10).maxLength(100).required())
    .prop('desc', S.string().minLength(10).maxLength(5000).required())
    .prop(
        'tags',
        S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_HARD_SIZE_LIMIT)).required(),
    )
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('div', S.string().minLength(3).maxLength(40))
    .prop('section', S.string().enum([Sections.Events]).required())
    .prop(
        'from',
        S.raw({
            type: 'string',
            format: 'date',
            formatMinimum: toDay(),
        }),
    )
    .prop(
        'to',
        S.raw({
            type: 'string',
            format: 'date',
            formatMinimum: toDay(),
        }),
    )
const eventsSchema_ = () => {
    return {
        called: false,
        def: eventsSchema,
    }
}

const mongoHex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
const message = S.object()
    .prop('unique_tab_id', S.string().minLength(36).maxLength(36))
    .prop('message', S.string().minLength(20).maxLength(200).required())
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('id', S.string().pattern(mongoHex))

const messageSchema = {
    body: message,
}

/*
    These are rules to be maintained all over the app On server side but
    also sometimes passed to client to be maintained on the browser.
    Keys as defined might represent:
    * The actual name of some context (HTTP method, route, ETA page, named forms (in partials)...)
    * Arbitrary chosen and reused elsewhere in the app 
    TODO: I will try to make some intelligence and have a clear definition of keys (the earlier case).
    Example 1: on 'api' env, the login page is requested (/login => login.eta), inputs in HTML named form 'doLogin' must have required tag
    Example 2: on 'api' env, the listings page is requested (/listings/, /listings/{section}/...),
    .........it includes partials ex: HTML named form 'queryGeolocation', inputs in HTML named form 'queryGeolocation' must have required tag
    Example 3: on 'api' env, user POSTs data, the appropriate endpoint handles validation accordingly
**/
const constraints = {
    api: {
        // GET represents endpoints which are eta pages...
        // Each page might contain partials (which are forms here)
        GET: {
            login: {
                doLogin: {
                    requiredUXInputs: ['username', 'password'],
                    minInputs: { username: 6, password: 5 },
                },
            },
            signup: {
                doSignup: {
                    requiredUXInputs: ['username', 'password', 'firsName', 'secondName'],
                    minInputs: { username: 6, password: 5, firsName: 2, secondName: 2 },
                },
            },
            reset: {
                doReset: {
                    requiredUXInputs: ['password'],
                    minInputs: { password: 8 },
                },
            },
            listings: {
                queryGeolocation: {
                    requiredUXInputs: [],
                },
                queryGwoogl: {
                    requiredUXInputs: ['title_desc'],
                    minInputs: { title_desc: 3 },
                },
                addSkill: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
                addMarket: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
                addBlog: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
                addEvent: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
            },
            listing: {
                addComment: {
                    requiredUXInputs: ['message'],
                },
            },
        },
        // POST represents constraints to be maintained on server, when data is POSTed
        POST: {
            login: {
                schema: loginSchema,
            },
            signup: {
                schema: signupSchema,
            },
            reset: {
                schema: resetSchema,
            },
            queryGeolocation: {
                schema: geolocationSchema,
            },
            queryGwoogl: {
                schema: gwooglSchema,
            },
            skills: {
                secured: true,
                upload: false,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema_,
            },
            markets: {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: marketsSchema_,
            },
            blogs: {
                secured: true,
                upload: false,
                geolocation: true,
                illustrations: false,
                schema: blogsSchema_,
            },
            events: {
                secured: true,
                upload: false,
                geolocation: true,
                illustrations: false,
                schema: eventsSchema_,
            },
            message: {
                schema: messageSchema,
            },
        },
    },
    // to change
    production: {
        GET: {
            login: {
                doLogin: {
                    requiredUXInputs: ['username', 'password'],
                    minInputs: { username: 6, password: 5 },
                },
            },
            signup: {
                doSignup: {
                    requiredUXInputs: ['username', 'password', 'firsName', 'secondName'],
                    minInputs: { username: 6, password: 5, firsName: 2, secondName: 2 },
                },
            },
            reset: {
                doReset: {
                    requiredUXInputs: ['password'],
                    minInputs: { password: 8 },
                },
            },
            listings: {
                queryGeolocation: {
                    requiredUXInputs: [],
                },
                queryGwoogl: {
                    requiredUXInputs: ['title_desc'],
                    minInputs: { title_desc: 3 },
                },
                addSkill: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
                addMarket: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
                addEvent: {
                    requiredUXInputs: ['title', 'desc', 'tags'],
                    minInputs: { title: 10, desc: 10 },
                },
            },
            listing: {
                addComment: {
                    requiredUXInputs: ['message'],
                },
            },
        },
        POST: {
            login: {
                schema: loginSchema,
            },
            signup: {
                schema: signupSchema,
            },
            reset: {
                schema: resetSchema,
            },
            queryGeolocation: {
                schema: geolocationSchema,
            },
            queryGwoogl: {
                schema: gwooglSchema,
            },
            skills: {
                secured: true,
                upload: false,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema_,
            },
            markets: {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: marketsSchema_,
            },
            blogs: {
                secured: true,
                upload: false,
                geolocation: true,
                illustrations: false,
                schema: blogsSchema_,
            },
            events: {
                secured: true,
                upload: false,
                geolocation: true,
                illustrations: false,
                schema: eventsSchema_,
            },
            message: {
                schema: messageSchema,
            },
        },
    },
}

export default constraints
