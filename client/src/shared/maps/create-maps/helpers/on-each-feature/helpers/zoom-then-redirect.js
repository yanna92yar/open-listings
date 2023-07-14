/**
 * zoom To Feature
 * @param {*} e
 */
export function zoomThenRedirectClosure(map) {
    return function zoomThenRedirect(e) {
        map.fitBounds(e.target.getBounds())
        const division = e.target.feature.properties.name || e.target.feature.properties.nom
        window.location.href = `/division/${encodeURIComponent(division)}` //${APIHost[process.env.NODE_ENV]}
    }
}
