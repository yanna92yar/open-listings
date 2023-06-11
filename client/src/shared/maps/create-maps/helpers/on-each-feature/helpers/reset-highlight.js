/**
 * resets Highlight
 * @param {*} e
 */
import { geoJson } from '../../../state.js'

export function resetHighlight(e) {
    geoJson.current.resetStyle(e.target)
}
