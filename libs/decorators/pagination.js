import perPage from '../../config/options/perPage.js'
// eslint-disable-next-line no-unused-vars
import * as Types from '../../types.d.js'

/**
 * @param {Types.RequestExtended} req
 * @param {Types.Reply} reply
 * @param {Types.Done} done
 */
export default function paginationHandler(req, reply, done) {
    const page = req.query.p || 1
    req.pagination = { perPage: perPage(), page: page }
    done()
}
