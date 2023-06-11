import { createRequire } from 'module'
import { give } from '../data.js'

const require = createRequire(import.meta.url)

// Example getting parent of 'Dresses'
// var parent = getKey('Dresses', googleTagsEnLevel2)
// var granpa = getKey(parent, googleTagsEnLevel1)

// derive parent tag from an array of arrays
function groupOneLevel(data, fstIdx, sndIdx) {
    const result = {}
    data.forEach((row) => {
        if (!result[row[fstIdx]]) {
            result[row[fstIdx]] = new Set()
        }
        result[row[fstIdx]].add(row[sndIdx])
    })
    return result
}

const { googleTagsEn, googleTagsFr } = give

const donLeveled = { en: {}, fr: {} }
donLeveled.en['level1'] = groupOneLevel(googleTagsEn, 0, 1)
donLeveled.en['level2'] = groupOneLevel(googleTagsEn, 1, 2)
donLeveled.fr['level1'] = groupOneLevel(googleTagsFr, 0, 1)
donLeveled.fr['level2'] = groupOneLevel(googleTagsFr, 1, 2)

function getKey(value, level) {
    for (const [key, values] of Object.entries(level)) {
        if (values.has(value)) {
            return key
        }
    }
}

const { googleTagsEnLite, googleTagsFrLite } = give
const allTags = {
    markets: {
        en: googleTagsEnLite,
        fr: googleTagsFrLite,
    },
    hobbies: {
        en: require('../../../data/taxonomy/hobbies_en.json'),
        fr: require('../../../data/taxonomy/hobbies_fr.json'),
    },
}

function getAscendants(keyword, lang, section) {
    let parent, granpa
    try {
        if (section === 'markets') {
            const parent = getKey(keyword, donLeveled[lang].level2)
            const granpa = getKey(parent, donLeveled[lang].level1)
            return [parent, granpa]
        }
        if (section === 'hobbies') {
            ;[parent = granpa] = getKey(keyword, allTags.hobbies[lang])
            return [parent, granpa]
        }
    } catch (error) {
        ;[parent = granpa] = keyword
        return [parent, granpa]
    }
    // TODO: other sections
    ;[parent = granpa] = keyword
    return [parent, granpa]
}

export { getAscendants, allTags }
