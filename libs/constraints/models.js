// TODO: Catch errors on use of these models (in mongo-queries and in routes)
import { ObjectId } from '@fastify/mongodb'
import { ArrayModel, BasicModel, ObjectModel } from 'objectmodel'
import { Sections } from '../../types.d.js'

const URL =
    '^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?'
const Coordinate = new BasicModel(Number)

// Exampel for JSdoc typing only
export const ListingModel = {
    title: '',
    tags: [''],
    parent: '',
    granpa: '',
    desc: '',
    cdesc: '',
    section: '',
    d: true,
    a: true,
    usr: '',
    // TODO: add front end constraints
    lang: '', //check
    // img: new RegExp(URL),

    // tagsLang: ['ar', 'fr', 'en'], //check
}
const Listing = new ObjectModel({
    title: String,
    tags: ArrayModel(String),
    parent: String,
    granpa: String,
    desc: String,
    cdesc: String,
    section: Object.values(Sections),
    d: Boolean,
    a: Boolean,
    usr: String,
    // TODO: add front end constraints
    lang: ['ar', 'fr', 'en', 'und'], //check
    // img: new RegExp(URL),

    // tagsLang: ['ar', 'fr', 'en'], //check
})

const Market = Listing.extend({
    section: Sections.Markets,
    lat: Number,
    lng: Number,
    offer: [Boolean],
    img: new RegExp(URL),
    thum: [new RegExp(URL)],
    geolocation: {
        type: 'Point',
        coordinates: ArrayModel(Coordinate)
            .extend()
            .assert((a) => a.length === 2, 'should have two coordinates'),
    },
    div: String,
}).assert(
    (o) => o.lat === o.geolocation.coordinates[1] && o.lng === o.geolocation.coordinates[0],
    'should have two coordinates | point mismatch',
)
// .assert(o => o.lang === o.tagsLang, "language mismatch")

const Event = Listing.extend({
    section: Sections.Events,
    lat: Number,
    lng: Number,
    geolocation: {
        type: 'Point',
        coordinates: ArrayModel(Coordinate)
            .extend()
            .assert((a) => a.length === 2, 'should have two coordinates'),
    },
    div: String,
    from: Date,
    to: Date,
})
    .assert(
        (o) => o.lat === o.geolocation.coordinates[1] && o.lng === o.geolocation.coordinates[0],
        'should have two coordinates | point mismatch',
    )
    .assert((o) => o.to.getTime() > Date.now(), 'The end of event must be in future')
    .assert((o) => o.to.getTime() >= o.from.getTime(), "End of event must be greater than it's start")

const Skill = Listing.extend({
    section: Sections.Skills,
    undraw: String,
    color: String,
    offer: [Boolean],
})

const Blog = Listing.extend({
    section: Sections.Blogs,
})
const Hobby = Listing.extend({
    section: Sections.Hobbies,
})

export const CommentModel = {
    from: '',
    to: '',
    sent: new Date(),
    thread: '',
    threadId: '',
    message: '',
}
const Comment = new ObjectModel({
    from: String,
    to: String,
    sent: Date,
    thread: String,
    threadId: String,
    message: String,
})
    .assert((c) => c.from !== c.to, 'comment to someone else')
    .assert((c) => ObjectId.isValid(c.threadId), 'thread Id is not a valid Mongo Id')

export const UserModel = {
    password: '',
    firstName: '',
    secondName: '',
    passhash: '',
    isVerified: true,
    role: '',
}
const User = new ObjectModel({
    username: String,
    password: [String],
    firstName: String,
    secondName: String,
    passhash: String,
    isVerified: Boolean,
    role: ['admin', 'regular'],
})
    .assert((u) => typeof u.password === 'undefined' || u.username !== u.password, 'username and password must differ')
    .assert((u) => typeof u.password === 'undefined' || u.password.length >= 8, 'password is too weak')

// TODO: assert only when password exists !

export { Market, Skill, Blog, Event, Hobby, Comment, User }
