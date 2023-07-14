// @ts-ignore
import { Tooltip } from 'bootstrap'
import InApp from 'detect-inapp'
import htmx from 'htmx.org'
import { setupTour } from './accessibility/setupTour.js'
import { setupAdsRotator } from './ads/setup-ads-rotator.js'
import { setupDelimitationsKeywords } from './auto-complete/setup-delimitations-keywords.js'
import { setupUndrawKeywords } from './auto-complete/setup-undraw-keywords.js'
import { setupInteractiveListings } from './cards/setup-interactive-listings.js'
import { setupInteractiveNotifications } from './cards/setup-interactive-notifications.js'
import { setupSadFace } from './collaboration/setup-sad-face.js'
import { setupPell } from './editor/setup-pell.js'
import { setupTabUuid } from './fingerprint/tabUuid.js'
import { setupScrollBlink } from './focus/scroll&blink.js'
// import { setupFontPicker } from './fonts/setup-font-picker'
import { CheckCSS } from 'checkcss'
import { setupI18n } from './i18n/setup-i18n.js'
import { loadFile } from './load-file/load-file.js'
import { country } from './maps/create-maps/state.js'
import { setupMaps } from './maps/setup-maps.js'
import { setupScreenFull } from './screenfull/setup-screenfull.js'
import { setupAutoComplete } from './search/setup-autocomplete.js'
import { setupHolmes } from './search/setup-holmes.js'
import { renderShared } from './syncing/render-json.js'
import { setupInputTags } from './tags/setup-input-tags.js'
import { setupSubscribeTags } from './tags/setup-subscribe-tags.js'
import { runToasts } from './toasts/toasts.js'
import { setupThemeSwitcher } from './tweakBootstrap/setup-theme-switcher.js'

/**
 * Fulfill promises on phone all other devices
 * Also crushes if one or all fail depending on environment
 * production is more permissive for fails than local/dev
 */
export const setupShared = () => {
    const absoarb = (x) => x
    absoarb(Tooltip)
    const log = window.log
    window.htmx = htmx
    log.info('Logging setup shared')
    const toArray = (a) => (Array.isArray(a) ? a : [a])
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera)
    let functions = [
        [setupI18n, true],
        [setupHolmes, true],
        [setupAutoComplete, true],
        [setupPell, true],
        [setupInputTags, true],
        [setupSubscribeTags, true],
        // Fix bugs
        // [setupFontPicker, true],
        // [setupLeaflet, true],
        // [setupDelimitationsKeywords, true], must run after loading country state
        [setupUndrawKeywords, true],
        [runToasts, true],
        // TODO: Fix not working favourite feature
        // [setupFavorites, true],
        [setupInteractiveListings, false],
        [setupInteractiveNotifications, true],
        [setupAdsRotator, false],
        [setupTour, false],
        [setupScrollBlink, true],
        [renderShared, true],
        [setupSadFace, false],
        [setupScreenFull, true],
        [setupTabUuid, true],
        [setupThemeSwitcher, true],
    ]
    if (inapp.isMobile) {
        log.info('RUNNING ON A MOBILE DEVICE')
        functions = functions.filter((p) => p[1])
    }
    // Instantiate Promises
    let promises = functions.map((p) => p[0]())

    const logPromises = (results) => {
        log.info('Logging succeeded promises')
        toArray(results).forEach((result) => log.info(result))
    }
    const logErrors = (errors) => {
        log.info('Logging failed promises')
        toArray(errors).forEach((error) => log.info(error))
    }

    Promise.all(promises)
        .then((results) => logPromises(results))
        .catch((errors) => logErrors(errors))

    // Other function calls that are not yet promisified
    // because I'm not sure yet what's asynchronous in there
    fetch(process.env.STATES_FILE_URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((json) => {
            country.states = json
            fetch(process.env.BORDERS_FILE_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(async (json) => {
                    country.borders = json.features[0].geometry.coordinates[0]
                    setupDelimitationsKeywords()
                    setupMaps()
                })
        })

    // TODO: Review sockets
    // setupSocket()
    // Global objects that I need as inline JS inside HTML (Could be attached 100% in JS though)
    window.loadFile = loadFile
    if (['development', 'localhost'].includes(process.env.NODE_ENV)) {
        const checkcss = new CheckCSS();
        checkcss.scan().watch();
    }

}
