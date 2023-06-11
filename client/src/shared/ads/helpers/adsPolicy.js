import InApp from 'detect-inapp'
import { noAds } from '../state.js'

export function checkPolicy() {
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera)
    const __grade__ = window.__grade__
    const __urls__ = window.__urls__ || []
    noAds.choice = ['development', 'localhost'].includes(process.env.NODE_ENV) || __grade__ <= 1 || inapp.isMobile
    noAds.grade = __grade__
    if (!noAds.choice) {
        noAds.urls = __urls__.slice(0, __grade__)
    }
}
