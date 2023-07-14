/**
 * ADD 'github.com/jaredreich/pell' RICH EDITOR
 * MUST EXIST:
 *    #editor
 *    #characters-left
 *    .add#description
 */
import pell from 'pell'
import { LIS } from '../../../helpers/lis.js'
import { stripHtml } from './helpers/stripe-html.js'
export const setupPell = function () {
    if (!LIS.id('message-editor')) {
        console.log('### function "setupPell" ignored well')
        return
    }
    // on succeeds on pages with `editor` and other inputs
    try {
        const editor = pell.init({
            element: LIS.id('message-editor'),
            onChange: (html) => {
                const raw = stripHtml(html)
                const charactersLeft = 200 - raw.length
                const count = LIS.id('characters-left')
                count.innerHTML = 'Characters left: ' + charactersLeft
                document.querySelectorAll('.add#message')[0].value = html
            },
            classes: {
                actionbar: 'pell-actionbar',
                button: 'pell-button',
                content: 'pell-content',
                selected: 'pell-button-selected',
            },
        })
        editor.content.innerHTML = ''
    } catch (error) {
        console.log(error.message)
    }
}
