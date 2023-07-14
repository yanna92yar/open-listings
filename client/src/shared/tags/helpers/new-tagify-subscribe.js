import Tagify from '@yaireo/tagify'
import { consts } from '../../../views/main/consts.js'

const TAG_HARD_SIZE_LIMIT = consts.tagSize
/**
 * @param tagified
 * @param input
 * @param {array} tags of some language
 * @param maxTags
 */
export function newTagifySub(tagified, input, tags, maxTags = 3) {
    if (tagified) {
        tagified.destroy()
    }
    tagified = new Tagify(input, {
        pattern: new RegExp(`^.{0,${TAG_HARD_SIZE_LIMIT}}$`),
        delimiters: ',',
        keepInvalidTags: false,
        maxTags,
        whitelist: tags,
        backspace: 'edit',
        placeholder: 'Type something',
        callbacks: {
            invalid: onInvalidTag,
        },
        dropdown: {
            position: 'text',
            enabled: 1, // show suggestions dropdown after 1 typed character
        },
    })

    let button = document.getElementById('subscribe')

    button.addEventListener('click', onAddButtonClick)

    function onAddButtonClick() {
        tagified.addEmptyTag()
    }

    function onInvalidTag(e) {
        console.log('invalid', e.detail)
    }

    return tagified
}
