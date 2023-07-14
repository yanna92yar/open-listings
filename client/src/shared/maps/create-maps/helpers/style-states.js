import { stringToColor } from './string-to-color.js'
/**
 * Gets style from name of state
 * @param {json} feature
 * @return {css} style
 */
export function styleStatesClosure(map) {
    return function styleStates(feature) {
        // string to color, then make it greener

        const color = stringToColor('bla').slice(0, 5) + '00'//stringToColor(feature.properties['name'] || feature.properties['nom']).slice(0, 5) + '00'
        const fillOpacity = map['name'] === 'gameMap' ? 0 : 0.6
        const weight = map['name'] === 'gameMap' ? 1 : 2
        const opacity = map['name'] === 'gameMap' ? 0.2 : 1
        return {
            fillColor: color,
            weight: weight,
            opacity: opacity,
            color: 'white',
            dashArray: '3',
            fillOpacity: fillOpacity,
        }
    }
}
