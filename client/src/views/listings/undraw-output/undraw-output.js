import SVGInjector from 'svg-injector'
import { LIS } from '../../../helpers/lis.js'
const __undrawColor__ = window.__color__
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Undraw output @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
export const undrawOutput = () => {
    if (LIS.id('undraw-output')) {
        setTimeout(() => {
            const IMGs = document.querySelectorAll('.svg2')
            SVGInjector(IMGs)
            setTimeout(() => {
                const allPaths2 = Array.from(document.querySelectorAll('#undraw-output svg'))[0].querySelectorAll('*')
                const color = __undrawColor__
                allPaths2.forEach((path) => {
                    if (path.getAttribute('fill') === '#6c63ff') {
                        path.setAttribute('fill', color)
                    }
                })
            }, 2000)
        }, 2000)
    }
}
