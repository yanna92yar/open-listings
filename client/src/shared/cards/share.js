// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ share @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

/**
 * Share event (card content: title & description) on some social networks
 * @param {HTMLElement} card
 */
import { Notyf } from 'notyf'

export const share = async (card) => {
    if (!navigator.share) {
        const notyf = new Notyf()
        notyf.error('Your browser does not support share')
        return
    }
    const htmlContent = card.parentElement.parentElement.childNodes
    let title, content
    htmlContent.forEach(function (node) {
        if (node.localName === 'h5') title = node.textContent
        if (node.localName === 'p') content = node.textContent
    })
    try {
        await navigator.share({ title: title, text: content })
        console.log('Data was shared successfully')
    } catch (err) {
        console.error('Share failed:', err.message)
    }
}
