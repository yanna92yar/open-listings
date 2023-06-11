/**
 * This style Cards in a way or another
 */
import tippy from 'tippy.js'
import { LIS } from '../../helpers/lis.js'
import { share } from './share.js'
const __context__ = window.__context__

export const setupInteractiveListings = async () => {
    if (['listings', 'alllistings', 'index'].indexOf(__context__) < 0) {
        return '### function "setupInteractiveListings" ignored well'
    }
    if (!LIS.classExists(['card', 'card-body', 'sharer'])) {
        return '### function "setupInteractiveListings" ignored well'
    }

    tippy('.deactivated', {
        content: 'Deactivated, you can reactivate it again!',
    })
    tippy('.nonapproved', {
        content: 'Not yet approved, wait for approval!',
    })
    document.querySelector('.sharer').addEventListener('click', function (e) {
        let item = e.target
        share(item)
    })
    return '### function "setupInteractiveListings" run successfully'
}
