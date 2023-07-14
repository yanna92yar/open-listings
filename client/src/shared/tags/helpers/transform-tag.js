// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ TAGIFY @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// The DOM element you wish to replace with Tagify
import { stringToColor } from '../../maps/create-maps/helpers/string-to-color.js'
import { lightenDarkenColor } from './colors/lighten-color.js'

/**
 *
 * @param {any} tagData
 */

export function colorContext(context) {
    return function transformTag(tagData) {
        tagData.style = '--tag-bg:' + lightenDarkenColor(stringToColor(tagData.value), 30)
        if (context && context === 'all-tags') {
            tagData.style += '; --readonly-striped: 0'
        }
    }
}
