// const arr = Object.keys(data)

const dedup = (arr) => [...new Set(arr)]
function truncate(str, n, useWordBoundary) {
    if (str.length <= n) {
        return str
    }
    const subString = str.slice(0, n - 1) // the original check
    return (useWordBoundary ? subString.slice(0, subString.lastIndexOf(' ')) : subString) + '&hellip;'
}

const toIgnore = [' ', ',', '-']
const replaceWith = '-'
const regexOrFormat = (arr) => `[${arr.join('')}]`
const toIgnoreRegex = new RegExp(regexOrFormat(toIgnore), 'g')
// eslint-disable-next-line no-control-regex
const controlCharacters = /[\u0000-\u001F\u007F-\u009F]/g
const clean = (str) => str.toLowerCase().replace(toIgnoreRegex, replaceWith).replace(controlCharacters, '')

/**
 * Flextags is a handy function to truncate and ignore some tags based
 * on their length. Typically tags of a short length.
 * It can be used to handle a big load of tags we have little controle on.
 *
 * @param {string[]} arr list of strings to handle
 * @param {boolean} inplace either change original array or return a clone
 * @param {number} ignoreLimit totally ignore tags starting from some length
 * @param {number} hardlimit must be less than 'ignoreLimit'. To truncate tags
 * @returns
 */
export function flexTags(arr, inplace = false, ignoreLimit = 30, hardlimit = 20) {
    let newArr
    if (!inplace) {
        newArr = arr.map((val) => {
            if (!val) return
            let cleanVal = clean(val)
            return truncate(cleanVal, hardlimit, false)
        })
        return dedup(newArr).filter((tag) => tag.length <= ignoreLimit)
    } else {
        const seen = new Set()
        arr.forEach((val, index) => {
            if (!val) return
            let cleanVal = clean(val)
            const newValue = truncate(cleanVal, hardlimit, false)
            if (seen.has(newValue)) arr[index] = ''
            else {
                seen.add(newValue)
                arr[index] = newValue
            }
        })
        // Creates one more array (but returns just after)
        arr = arr.filter(Boolean).filter((tag) => tag.length <= ignoreLimit)
    }
}

// console.warn('Any operation either in place or not sorts tags beforehand and therefore changes the original input in that way.')
// console.log(flexTags({ arr, inplace: true, limit: 10, hardlimit: 20 }))
// console.log(arr)
