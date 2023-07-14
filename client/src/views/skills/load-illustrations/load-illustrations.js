/**
 * loads Illustrations
 * @param {dom} keyword
 */

import SimpleLightbox from 'simple-lightbox'
import { undrawGallery } from '../../../data/undraw.js'
import { buildMiniaturesGrid } from './helpers/build-miniatures-grid.js'
import { getAllIndexes } from './helpers/get-all-indexes.js'
import { lightbox } from './state/lightbox.js'
let corpus = []
if (typeof undrawGallery !== 'undefined') {
    corpus = undrawGallery.map((a) => a.tags.split(', '))
}
export const loadIllustrations = (keyword) => {
    if (lightbox.current) {
        lightbox.current.destroy()
    }
    if (corpus.length && keyword) {
        const scoreIt = (tags) => tags.indexOf(keyword) > -1 && 1 / tags.length
        const scores = corpus.map(scoreIt)
        const bestImgIdx = getAllIndexes(scores, Math.max(...scores))
        const simpleLightboxInput = bestImgIdx.map((idx) => undrawGallery[idx].image).slice(0, 3)
        if (simpleLightboxInput.length) {
            lightbox.current = SimpleLightbox.open({
                items: simpleLightboxInput,
            })
            buildMiniaturesGrid(simpleLightboxInput)
        }
    }
}
