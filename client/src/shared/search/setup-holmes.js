/**
 * ADD 'github.com/Haroenv/holmes' INSTANT SEARCH
 * MUST EXIST:
 *    .search input (search input)
 *    .row .card p (complex nested elements to ensure the page we are in)
 *    .col-sm (what to search, show and hide in case it matches)
 */
import holmes from 'holmes.js'
const __context__ = window.__context__

export const setupHolmes = async () => {
    if (['listings', 'alllistings', 'index'].indexOf(__context__) < 0) {
        return '### function "setupHolmes" ignored well'
    }
    if (!document.querySelector('.row .card p')) {
        return '### function "setupHolmes" ignored well'
    }

    holmes({
        input: '.search input',
        find: '.col-sm',
        placeholder: '<h3>— No results, my dear Watson. —</h3>',
        mark: true,
        hiddenAttr: true,
        class: {
            visible: 'visible',
            hidden: 'hidden',
        },
        onHidden(el) {},
        onFound(el) {},
        onInput(el) {},
        onVisible(el) {},
        onEmpty(el) {},
    })
    return '### function "setupHolmes" run successfully'
}
