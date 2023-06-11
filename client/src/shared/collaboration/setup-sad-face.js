// Credit:
// Source: https://codepen.io/dwmkerr/pen/ejejeX
// Author: Dave Kerr

import { LIS } from '../../helpers/lis.js'

function interpolateColor(color1, color2, scale) {
    const r1 = parseInt(color1.substr(1, 2), 16)
    const g1 = parseInt(color1.substr(3, 2), 16)
    const b1 = parseInt(color1.substr(5, 2), 16)
    const r2 = parseInt(color2.substr(1, 2), 16)
    const g2 = parseInt(color2.substr(3, 2), 16)
    const b2 = parseInt(color2.substr(5, 2), 16)

    const r = Math.round(r1 + scale * (r2 - r1))
    const g = Math.round(g1 + scale * (g2 - g1))
    const b = Math.round(b1 + scale * (b2 - b1))

    const hex = (val) => val.toString(16).padStart(2, '0')

    return `#${hex(r)}${hex(g)}${hex(b)}`
}

//  Returns the bezier points for a smile. Scale is 0-1.
function smilePoints(scale) {
    const factor = scale * 2 - 1 // i.e sad = -1, happy = +1
    const p1 = { x: -20, y: -10 * factor }
    const c1 = { x: -20, y: 10 * factor }
    const p2 = { x: 20, y: -10 * factor }
    const c2 = { x: 20, y: 10 * factor }
    return [p1, c1, c2, p2]
}

function writeSmilePoints(points) {
    const p = (p) => `${p.x},${p.y}` // write a point as a coord
    return `M${p(points[0])} C${p(points[1])} ${p(points[2])} ${p(points[3])}`
}

function scaleSmile(scale) {
    //  Get the geometry of the new smile.
    const points = writeSmilePoints(smilePoints(scale))
    const svg = document.getElementById('github')

    //  Create the geometry animation, which will look summat like this:
    //  <animate attributeName="d" attributeType="XML"
    //    to="M-20,10 C-20,-10 20,-10 20,10" dur="3s" repeatCount="indefinite"
    //    fill="freeze" />
    const smilePath = document.getElementById('smilepath')
    const animate = document.createElementNS(svg.namespaceURI, 'animate')
    animate.setAttribute('attributeName', 'd')
    animate.setAttribute('attributeType', 'XML')
    animate.setAttribute('to', points)
    animate.setAttribute('dur', '0.3s')
    animate.setAttribute('repeatCount', '1')
    animate.setAttribute('fill', 'freeze')
    smilePath.appendChild(animate)
    animate.beginElement()

    //  Animate the face color.
    const faceCircle = document.getElementById('facecircle')
    const a = document.createElementNS(svg.namespaceURI, 'animate')
    a.setAttribute('attributeName', 'fill')
    a.setAttribute('attributeType', 'CSS')
    a.setAttribute('dur', '0.3s')
    a.setAttribute('to', interpolateColor('#FF0000', '#FAD257', scale))
    a.setAttribute('fill', 'freeze')
    faceCircle.appendChild(a)
    a.beginElement()
}

export const setupSadFace = async () => {
    if (!LIS.id('github')) {
        return '### function "setupSadFace" ignored well'
    }
    setTimeout(() => {
        scaleSmile(0)
    }, 200)
    setTimeout(() => {
        scaleSmile(1)
    }, 400)
    window.addEventListener('error', function (event) {
        console.log('an error occurred !!!!!!!!!!!!!!!!!!!!!!!!!')
        setTimeout(() => {
            scaleSmile(0.5)
            scaleSmile(0)
        }, 2000)
    })
    return '### function "setupSadFace" run successfully'
}
