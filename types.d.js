/**
 * @typedef {'markets'| 'skills'|  'blogs'|  'events'|  'hobbies'} Sections
 */

/**
 * @typedef {import('fastify').FastifyRequest} Request
 * @typedef {import('fastify').FastifyReply} Reply
 * @typedef {import('fastify').FastifyError} Error
 * @typedef {import('fastify').HookHandlerDoneFunction} Done
 * @typedef {import('fastify').FastifyInstance} Fastify
 * 
 * @typedef {{p: number}} Query
 * @typedef {{locale: string}} Locale
 * @typedef {{unique_tab_id: string}} Tab
 * @typedef {{unique_tab_id: string}} Body
 * @typedef {{division: string}} Division
 * @typedef {{keyword: string}} Keyword
 * @typedef {{tag: string}} Tag
 * @typedef {{username: string}} Username
 * @typedef {{id: string}} ID
 * @typedef {{p: string}} P
 * @typedef {{section: Sections}} Section
 * @typedef {{perPage: number, page: number}} Pagination
 * @typedef {{username: string, proof: number}} Session
 * @typedef {Request & {params: Tab & Division & Keyword & Tag & Username & ID & P & Section & Locale} & {body: Body} & {query: Query} & {pagination: Pagination} & {session: Session} & {fastify: Fastify}} RequestExtended
 * @typedef {Reply & {blabla: Function}} ReplyExtended
 */



/**
 * @typedef {object} Listing
 * @property {string} [unique_tab_id]
 * @property {string} title
 * @property {string} desc
 * @property {array} tags
 * @property {Sections} section
 * @property {boolean} [offer=false]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {string} [div]
 * @property {string[]} [font]
 * @property {string[]} [undraw]
 * @property {string} [color]
 * @property {string} [from]
 * @property {string} [to]
 * calculated after (optional)
 * @property {string} [lang]
 * @property {string} [cdesc]
 * @property {string} [usr]
 */

/**
 * @typedef {object} MessageSchema
 * @property {string} [unique_tab_id]
 * @property {string} message
 * @property {string} [cmsg]
 * @property {string} [lang]
 * @property {string} username
 * @property {string} id
 */

/**
 * @typedef {object} LoginSchema
 * @property {string} [unique_tab_id]
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {object} SignupSchema
 * @property {string} [unique_tab_id]
 * @property {string} username
 * @property {string} password
 * @property {string} firstName
 * @property {string} secondName
 */

/**
 * @typedef {object} geolocationSchema
 * @property {string} [unique_tab_id]
 * @property {number} lat
 * @property {number} lng
 * @property {"markets"|"events"} section
 */

/**
 * @typedef {object} gwooglSchema
 * @property {string} [unique_tab_id]
 * @property {string} title_desc
 * @property {boolean} [exact=false]
 * @property {string} [div_q]
 * @property {string} [since]
 * @property {Sections} section
 */

export const Types = {}

export const Contexts = {
	Index: "index",
	Listings: "listings",
	Geolocation: "geolocation",
	Gwoogl: "gwoogl",
	AllTags: "all-tags",
	AllListings: "alllistings",
	Messages: "messages",
}

export const Sections = {
	Markets: 'markets',
	Skills: 'skills',
	Blogs: 'blogs',
	Events: 'events',
	Hobbies: 'hobbies'
}

export const Collections = {
	Words: 'words',
	Listing: 'listings',
	Users: 'users',
	Userstemp: 'userstemp',
	Comment: 'comment',
	Events: 'events',
	Announcements: 'announcements'
}
