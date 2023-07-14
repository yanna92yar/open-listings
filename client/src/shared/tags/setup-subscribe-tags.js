import { state } from '../../data/state.js'
import { getCookies } from '../../helpers/get-cookies.js'
import { newTagifySub } from './helpers/new-tagify-subscribe.js'
const inputElm =
    document.querySelector('.subscribe#markets') ||
    document.querySelector('.subscribe#skills') ||
    document.querySelector('.subscribe#events') ||
    document.querySelector('.subscribe#blogs') ||
    document.querySelector('.subscribe#hobbies')
let tagifyObj
const choices = document.getElementsByClassName('tags-sub-lang')

export const setupSubscribeTags = async () => {
    if (choices.length !== 3 || !inputElm) {
        return '### function "setupSubscribeTags" ignored well'
    }
    // For gender specific datasets ESCOT
    const getTags = (json) => {
        if (json[0].masculine) {
            return json.map((tag) => tag.masculine)
        }
        return json
    }
    const dataURLs = [
        `/data/get_${inputElm.id}_tags_ar`,
        `/data/get_${inputElm.id}_tags_en`,
        `/data/get_${inputElm.id}_tags_fr`,
    ]

    const promises = dataURLs.map((url) => fetch(url).then((y) => y.json()))
    Promise.all(promises)
        .then((arr) => {
            state.tags['ar'] = state.tags['ar'] ? state.tags['ar'] : getTags(arr[0].tags)
            state.tags['en-US'] = state.tags['en-US'] ? state.tags['en-US'] : getTags(arr[1].tags)
            state.tags['fr'] = state.tags['fr'] ? state.tags['fr'] : getTags(arr[2].tags)
            tagifyPage()
            return '### function "setupSubscribeTags" run successfully'
        })
        .catch((err) => {
            console.log(err.message)
            return new Error('### function "setupSubscribeTags" failed')
        })
    // Tagify the current page based on section and current language
    function tagifyPage() {
        // Default load tags based on user language
        const cookies = getCookies()
        const lang = cookies.locale
        if (state.tags[lang]) {
            tagifyObj = newTagifySub(tagifyObj, inputElm, state.tags[lang])
            tagifyObj.lang = lang
        }
        ;[].forEach.call(choices, function (choice) {
            const lang = choice.value
            choice.onclick = function () {
                console.log('new language for tags')
                if (state.tags[lang] && inputElm) {
                    if (!tagifyObj || (tagifyObj && tagifyObj.lang !== lang)) {
                        // tagifyObj.destroy()
                        tagifyObj = newTagifySub(tagifyObj, inputElm, state.tags[lang])
                    }
                    tagifyObj.lang = lang
                }
            }
        })
    }
}
