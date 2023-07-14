// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Sync data @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { markRequiredInputs, updatePostPostInputs } from './ReactiveUI/constraints.js'
// import { renderTopByDiv, renderTopSearches, renderTopTags } from './renderers/renderer.js'

export const renderShared = async () => {
    // if (window.__section__) {
    //     renderTopTags(window.__section__)
    // }
    // renderTopSearches()
    // renderTopByDiv()
    markRequiredInputs()
    updatePostPostInputs()
    return '### function "renderShared" run successfully'
}
