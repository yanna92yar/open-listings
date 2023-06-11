import L from 'leaflet'
import { GeoSearchControl, MapBoxProvider } from 'leaflet-geosearch'
// import 'leaflet.fullscreen'
// import screenfull from 'screenfull';
import { onEachFeatureClosure } from './helpers/on-each-feature/on-each-feature.js'
import { styleStatesClosure } from './helpers/style-states.js'
import { country, geoJson } from './state.js'
// window.screenfull = screenfull
/**
 * create delimitations Map
 */

const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const osmAttrib = 'Map data &copy; OpenStreetMap contributors'
const provider = new MapBoxProvider({
    params: {
        access_token: process.env.MAPBOX_GEO_SEARCH || '',
    },
})
export function delimitationsMap({ lat, lng, layerFactory, zoom }) {
    // @ts-ignore
    const searchControl = new GeoSearchControl({
        provider: provider,
    })
    const container = L.DomUtil.get('delimitations-map')
    if (container != null) {
        container['_leaflet_id'] = null
    }
    let map = new L.Map('delimitations-map')
    map['name'] = 'delimitationsMap'
    map.addControl(searchControl)
    map.addLayer(layerFactory(osmUrl, osmAttrib, false))
    map.setView(new L.LatLng(lat, lng), zoom)
    geoJson.current = L.geoJson(country.states, {
        style: styleStatesClosure(map),
        onEachFeature: onEachFeatureClosure(map),
    }).addTo(map)
    setTimeout(() => {
        map.invalidateSize()
    }, 300)
    return map
}
