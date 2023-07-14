# Services

Here we put any processing logic which happens in a request lifecycle:

- `data.js` loads data from disk on bootstrap (TODO: uniform data if possible. License attribution if necessary.)
- `helper.js` is a collection of used algorithms (self-contained *routines*)
- `mongo-queries` our little mongo API
- `Pipeline` like `helpers.js` but more like a `MAIN` function, there are processing pipelines like: `clean(body).removeBadWords('description').validate()`
- `redis-queries` and `typesence-queries` are APIs for Redis and Typesence interactions
- `renderer.js` is simply delivers user-friendly messages to `reply.view` in `/routes`
- `dictionary.js` is based on our own separate API. (word to word brain project)  
- `mailer.js` is based on Mail-Time to send automated notifications (emails) to users based on their actions

---

## License
  View [license](/LICENSE)  
  If
 you have any questions about our projects you can email [yanna92yar@gmail.com](mailto:yanna92yar@gmail.com)
