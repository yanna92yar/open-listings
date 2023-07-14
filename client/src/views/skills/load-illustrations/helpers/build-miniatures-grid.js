import SVGInjector from 'svg-injector'
import { allPaths } from '../state/all-paths.js'
import { lightbox } from '../state/lightbox.js'
import { chosenImg } from './chosen-img.js'
/**
 * build Miniatures Grid with undraw illustrations
 * @param {String} urls
 */
export function buildMiniaturesGrid(urls) {
    // Empty 'img-container' parent div from possible earlier images
    const paras = document.getElementsByClassName('img-container')
    while (paras[0]) {
        paras[0].parentNode.removeChild(paras[0])
    }
    // Empty 'allPaths' from possible earlier SVGs
    allPaths.current = undefined
    // Define new 'img-container' divs
    window.chosenImg = chosenImg
    urls.forEach((url, idx) => {
        const container = `<div class="img-container">
      <img class="svgg" src="${url}"/> 
      <input type="radio" class="img-radio" name="img_radio" id="${idx}"
      onclick="chosenImg(this)" />
    </div>`
        document.getElementById('undraw-input').insertAdjacentHTML('beforeend', container)
    })
    // Convert img tags to full SVG markups
    setTimeout(() => {
        try {
            const IMGs = document.querySelectorAll('img.svgg')
            SVGInjector(IMGs)
            setTimeout(() => {
                const SVGs = Array.from(document.querySelectorAll('.img-container svgg'))
                SVGs.forEach((svg, idx) => {
                    svg.onclick = function () {
                        lightbox.current.showPosition(idx)
                    }
                })
            }, 2000)
        } catch (error) {
            console.error(error)
        }
    }, 2000)
}
