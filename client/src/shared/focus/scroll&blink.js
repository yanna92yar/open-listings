import { LIS } from '../../helpers/lis.js'

export const setupScrollBlink = async () => {
    const id = window.__toFocus__

    if (!id || !LIS.id(id + '-@@@@@')) {
        return '### function "setupScrollBlink" ignored well'
    }
    const element = LIS.id(id + '-@@@@@')
    element.classList.add('blink')
    element.scrollIntoView({ behavior: 'smooth' })
    return '### function "setupScrollBlink" run successfully'
}
