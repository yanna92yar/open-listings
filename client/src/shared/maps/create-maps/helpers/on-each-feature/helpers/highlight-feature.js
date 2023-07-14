/**
 * highlights a Feature
 * @param {*} e
 */
export function highlightFeature(e) {
    const layer = e.target
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7,
    })
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront()
    }
}
