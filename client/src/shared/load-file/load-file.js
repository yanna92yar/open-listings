/**
 * Loads an image to be uploaded on browser
 * side effect: LIS.id('output')
 * @param {event} event
 */
import { LIS } from '../../helpers/lis.js'
export const loadFile = function (event) {
    const image = LIS.id('output')
    image.src = URL.createObjectURL(event.target.files[0])
    image.style.width = '200px'
}
