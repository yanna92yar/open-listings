# Open-listings

**Tests for the whole app**  

Tests are to be run with `npm run test`. Or manually (Postman or others) by running normally via `npm run start` but with `NODE_ENV === 'api'` 

We use `node-tap` for tests all over because it is simple and easy. 
To test the Fastify app, we build the app without running it as normal like this: `buildFastify(false).then((fastify) => { /*tests*/ }`

The only thing to mention, with `buildFastify(false)` the app doesn't start already.

`buildFastify(false)` with `NODE_ENV === 'api'` the app is instantiated very quickly without ML models or big data feeds (also to ease tests, we deactivate so much functionalities (like authentication)).

Todos  
 - Web app availability (ping some endpoints)
 - Data consistency:
    - Some endpoints must return results (autocompletion: `/keyword/:keyword`)
    - Some tags must have a couple of `parent` and `granpa` tags (markets section)
    - Tags in each listing document must be a well defined tag
    - etcetera: we can imagine more and more
 - Scalability tests: test `libs/constraints/models.js`
 - Edge cases:
    - Run with an empty database
    - `POST` random data (empty forms, long inputs ...)
    - `POST` corrupt data (upload an audio instead of an image for example)
    - Test `libs/services/external-apis/mongo-queries.js` by pointing to `libs/routes/debug.js` (good stuff)
    - Not found endpoints
    - etcetera






---

## License
<a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.
Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0)


