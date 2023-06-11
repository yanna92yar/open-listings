/* eslint-disable no-undef */

// @ts-ignore
let db = new Mongo().getDB("listings_db");

db.createCollection('users', { capped: false });
db.createCollection('words', { capped: false });
db.createCollection('listing', { capped: false });
db.createCollection('userstemp', { capped: false });
db.createCollection('comment', { capped: false });
db.createCollection('events', { capped: false });

// console.log(mongorestore)