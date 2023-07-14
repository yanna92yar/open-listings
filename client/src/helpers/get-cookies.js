// COOKIES ARE DEFINED IN SERVER WITH LOCAL=xx
// parse String Cookie into Object
// Author: https://gist.github.com/rendro/525bbbf85e84fa9042c2
export const getCookies = () =>
    // eslint-disable-next-line no-undef
    document.cookie.split(';').reduce((res, c) => {
        const [key, val] = c.trim().split('=').map(decodeURIComponent)
        try {
            return Object.assign(res, { [key]: JSON.parse(val) })
        } catch (e) {
            return Object.assign(res, { [key]: val })
        }
    }, {})
