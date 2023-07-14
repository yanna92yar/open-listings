import { nonLatin } from '../../constraints/regex.js'

const hrefsRegex = /href\s*=\s*(['"])(https?:\/\/.+?)\1/gi
const safebrowsingRedir = '127.0.0.1:8080/r?url='

// TODO: use safebrowsing API
// eslint-disable-next-line no-unused-vars
function updateLinksInHTML(html) {
    let link
    while ((link = hrefsRegex.exec(html)) !== null) {
        html = html.replace(link[2], safebrowsingRedir + encodeURIComponent(link[2]))
    }
    return html
}
// TODO:  internal = updateLinksInHTML(internal)

// Remove non latin
// Credit
// Author: rjanjic
// Source: https://stackoverflow.com/a/22075070
let wordsInText = (text) => text.match(nonLatin)

// Turn a bad title to a good one
// "hello this is a-- nice @ tit buttyyyy it is very longgggggggggg"
// 'hello this is a nice tit hello'
function toTitle(longBadTitle, limit = 60) {
    // Remove non latin
    longBadTitle = longBadTitle.charAt(0).toUpperCase() + longBadTitle.slice(1)
    longBadTitle = wordsInText(longBadTitle).join(' ')
    if (longBadTitle < 10) throw Error('very bad title')
    if (longBadTitle.length < limit) return longBadTitle
    let type = ''
    let title = longBadTitle.split(' ').reduce((acc, word) => {
        if (!acc) return word
        if (acc.length >= limit || acc.length > limit - 3) return acc
        if (acc.length + word.length >= limit) {
            if (word.length < 6) return acc + ' ' + word
            return (acc + ' ' + word).slice(0, limit)
        } else {
            return acc + ' ' + word
        }
    }, type)
    return title
}

/**
 * Generate initials from an email string
 * Like "sracer2024@yahoo.com" => "S2"
 * @param {String} email_
 * @return {String}
 */
function initials(email_) {
    let email =
        email_
            .split('@')[0]
            .replace(/[0-9]/g, '')
            .split(/[.\-_]/) || []
    if (email.length === 1) {
        return email[0].slice(0, 2).toUpperCase()
    }
    email = ((email.shift()[0] || '') + (email.pop()[0] || '')).toUpperCase()
    return email
}

export { toTitle, initials }
