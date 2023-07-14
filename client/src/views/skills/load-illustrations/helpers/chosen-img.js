// Hopefully this stays online for a while
// https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.
// ssl.cf5.rackcdn.com/illustrations/
import { LIS } from '../../../../helpers/lis.js'
import { lightbox } from '../state/lightbox.js'
import { pastColor } from '../state/past-color.js'

/**
 * chosen Img
 * @param {dom} radio
 */
export function chosenImg(radio) {
    const svgURL = lightbox.current.items[radio.id]
    const chosen = svgURL.split('/')[4].split('.')[0]
    if (chosen) {
        const undrawInput = LIS.id('undraw')
        const colorInput = LIS.id('color')
        undrawInput.value = chosen
        colorInput.value = pastColor.current
    }
}
