import L from 'leaflet'
import { moveableMarker } from './helpers/marker/setup-marker.js'
import { country } from './state.js'

let map
let circle
const latLngs = []
const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const osmAttrib = 'Map data &copy; OpenStreetMap contributors'
// "listing-map" is used for both cases: /listings/section & listings/id/__id__
// This is to differentiate between the current context (used to moveableMarker etc..)
const __isASingleListing__ = window.__id__
/**
 * create a listing's Map
 */
export function listingMap({ lat, lng, zoom, layerFactory }) {
    const coordinates = country.borders
    let container = L.DomUtil.get('listing-map')
    if (container != null) {
        container['_leaflet_id'] = null
    }
    map = new L.Map('listing-map')
    map['name'] = 'listingMap'
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    map.addLayer(layerFactory(osmUrl, osmAttrib, isDarkMode))
    map.setView(new L.LatLng(lat, lng), zoom)
    // transform geojson coordinates into an array of L.LatLng
    for (const element of coordinates) {
        latLngs.push(new L.LatLng(element[1], element[0]))
    }
    L.mask(latLngs).addTo(map)
    // console.log(names);
    circle = L.circle([lat, lng], 6000).addTo(map)
    // let lastValid = []
    // let moveable
    // lastValid = [lat, lng]
    // ;[moveable, lastValid] = moveableMarker(map, circle, coordinates)
    if (!__isASingleListing__) moveableMarker(map, circle, coordinates)
    // Refresh tiles after some time
    // because it doesn't load properly at first
    setTimeout(() => {
        map.invalidateSize()
    }, 300)
    return map
}
