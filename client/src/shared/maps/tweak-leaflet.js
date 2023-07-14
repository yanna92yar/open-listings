/**
 * All tweaks for pre-setting leaflet maps code
 *
 */
import L from 'leaflet'
export const tweakLeaflet = () => {
    // Make polygones possible (setting colored masks)
    L.Mask = L.Polygon.extend({
        options: {
            stroke: false,
            color: '#333',
            fillOpacity: 0.5,
            clickable: true,
            outerBounds: new L.LatLngBounds([-90, -360], [90, 360]),
        },

        initialize: function (latLngs, options) {
            const outerBoundsLatLngs = [
                this.options.outerBounds.getSouthWest(),
                this.options.outerBounds.getNorthWest(),
                this.options.outerBounds.getNorthEast(),
                this.options.outerBounds.getSouthEast(),
            ]
            L.Polygon.prototype.initialize.call(this, [outerBoundsLatLngs, latLngs], options)
        },
    })
    L.mask = function (latLngs, options) {
        return new L.Mask(latLngs, options)
    }
}
