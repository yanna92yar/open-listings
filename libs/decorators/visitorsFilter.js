// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'
// import isbot from 'isbot'

/**
 * @param {Types.Request} req
 * @param {Types.Reply} reply
 * @param {Types.Done} done
 */
function isBot(req, reply, done) {
    // TODO: Is it needed to deal with crawlers somehow?
    // if (isbot(request.headers['user-agent'])) {
    //     throw new Error('Please retry later')
    // }
    done()
}

export default isBot
