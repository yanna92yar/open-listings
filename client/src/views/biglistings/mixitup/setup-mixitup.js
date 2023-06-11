// import { LIS } from '../../helpers/lis.js'
import mixitup from 'mixitup'
const __context__ = window.__context__
const __section__ = window.__section__

export const setupMixitup = () => {
    if (
        !__section__ &&
        (__context__ === 'alllistings' ||
            __context__ === 'geolocation' ||
            __context__ === 'gwoogl' ||
            __context__ === 'messages')
    ) {
        try {
            console.log('### function "setupMixitup" run successfully on context' + __context__)
            mixitup('.mixitup_container', {
                animation: {
                    enable: true,
                    effects: 'fade',
                    easing: 'ease-in-out',
                    duration: 300,
                },
            })
        } catch (error) {
            console.log('### function "setupMixitup" failed')
        }
    }
}
