/**
 * Is marker (lat, lng) inside a polygon
 * @param {latlng} marker
 * @param {coordinates} vs
 * @return {boolean}
 */
export function isMarkerInsidePolygon(marker, vs) {
    try {
        const x = marker.getLatLng().lat
        const y = marker.getLatLng().lng

        let inside = false
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][1]
            const yi = vs[i][0]
            const xj = vs[j][1]
            const yj = vs[j][0]

            const intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
            if (intersect) inside = !inside
        }

        return inside
    } catch (error) {
        return false
    }
}
