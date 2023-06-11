import autoComplete from '@tarekraafat/autocomplete.js'
import { undrawGallery } from '../../data/undraw.js'

export const setupUndrawKeywords = async () => {
    return new Promise(function (resolve, reject) {
        if (!document.getElementsByName('illu_q').length) {
            return resolve('### function "setupUndrawKeywords" ignored well')
        }
        const corpus = undrawGallery.map((a) => a.tags.split(', '))
        const keywords = [...new Set(corpus.flat())]
        try {
            new autoComplete({
                selector: '#autoComplete-illu',
                placeHolder: 'Illustrations...',
                data: {
                    src: keywords,
                },
                resultItem: {
                    highlight: {
                        render: true,
                    },
                },
            })
            return resolve('### function "setupUndrawKeywords" run successfully')
        } catch (error) {
            return reject(new Error('### function "setupUndrawKeywords" failed'))
        }
    })
}
