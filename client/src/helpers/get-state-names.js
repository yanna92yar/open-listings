import { getStateNamesByLang } from '../shared/maps/geoJSONEncoder.js'
import { getCookies } from './get-cookies.js'

export const getStateNames = () => {
    const lang = getCookies().locale
    return getStateNamesByLang(lang)
}
