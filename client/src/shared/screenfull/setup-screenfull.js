import screenfull from 'screenfull'
import { LIS } from '../../helpers/lis.js'

export const setupScreenFull = async () => {
    const elements = LIS.elements('screenfull')
    elements.forEach((element) => {
        const button = LIS.id(`${element.id}-screenfull`)
        if (!button) return
        button.addEventListener('click', () => {
            if (screenfull.isEnabled) {
                screenfull.request(element)
            }
        })
    })
    return '### function "setupScreenFull" run successfully'
}
