import { LIS } from '../../helpers/lis.js'

function getTabUID() {
    let uid = window.sessionStorage.getItem('unique_tab_id')
    if (!uid || !window.name) {
        uid = generateUuid()
        window.sessionStorage.setItem('unique_tab_id', uid)
    }
    window.name = uid
    return uid
}

// uuid of length 36
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

/**
 *
 * @param {NodeListOf<Element>} links
 * @param {string} uuid
 */
function boostLinks(links, uuid) {
    links.forEach((link) => {
        if (link.href.indexOf(uuid) === -1) {
            link.href = new URL(link.href).pathname
            link.href += `/${uuid}`
        }
    })
}
// TODO: trigger again on htmx search
export const setupTabUuid = async () => {
    const tabUuid = getTabUID()
    const forms = document.forms
    const linksToBoost = LIS.elements('page-link-boosted')
    for (const element of forms) {
        const hiddenUuidInput = document.createElement('input')
        hiddenUuidInput.setAttribute('type', 'hidden')
        hiddenUuidInput.setAttribute('name', 'unique_tab_id')
        hiddenUuidInput.setAttribute('value', tabUuid)
        element.appendChild(hiddenUuidInput)
        boostLinks(linksToBoost, tabUuid)
    }
    return '### function "setupTabUuid" run successfully'
}

document.body.addEventListener('htmx:afterSwap', function (evt) {
    if (evt.detail.xhr.status === 404) {
        // alert the user when a 404 occurs (maybe use a nicer mechanism than alert())
        alert('Error: Could Not Find Resource')
    } else if (evt.detail.xhr.status === 422) {
    } else if (evt.detail.xhr.status === 418) {
        // evt.detail.target
    } else if (evt.detail.xhr.status === 200) {
        const tabUuid = getTabUID()
        // const linksToBoost = LIS.elements('page-link-boosted', evt.detail.target)
        const linksToBoost = LIS.elements('page-link-boosted', document)
        boostLinks(linksToBoost, tabUuid)
    }
})
