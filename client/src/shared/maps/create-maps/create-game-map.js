import * as L from 'leaflet'
// import 'leaflet.fullscreen';
// import screenfull from 'screenfull';
import { io } from 'socket.io-client'
import { onEachFeatureClosure } from './helpers/on-each-feature/on-each-feature.js'
import { styleStatesClosure } from './helpers/style-states.js'
import { country, geoJson } from './state.js'
// window.screenfull = screenfull;

const latLngs = []
const someColor = (idx) => {
    return [
        '#fff100',
        '#ff8c00',
        '#e81123',
        '#ec008c',
        '#68217a',
        '#00188f',
        '#00bcf2',
        '#00b294',
        '#009e49',
        '#bad80a',
    ][idx || Math.floor(Math.random() * 4)]
}

function refresh(circles, clusters) {
    circles.forEach((circle) => {
        const { lat, lng } = circle.getLatLng()
        clusters.forEach((arr, idx) => {
            const found = arr.filter((rr) => {
                return rr[0] === lat && rr[1] === lng
            })
            if (found.length) {
                circle.cluster = idx
            }
        })
    })
}

const osmUrl = 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
const osmAttrib =
    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/**
 * create Game map (connected with server by sockets)
 */
export function gameMap({ lat, lng, layerFactory, zoom }) {
    const coordinates = country.borders
    const states = country.states
    const container = L.DomUtil.get('game-map')
    if (container != null) {
        container['_leaflet_id'] = null
    }
    let map = new L.Map('game-map')
    map['name'] = 'gameMap'
    map.addLayer(layerFactory(osmUrl, osmAttrib, false))
    map.setView(new L.LatLng(lat, lng), zoom)
    geoJson.current = L.geoJson(states, {
        style: styleStatesClosure(map),
        onEachFeature: onEachFeatureClosure(map),
    }).addTo(map)
    // create a fullscreen button and add it to the map
    // L.control
    //     .fullscreen({
    //         position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
    //         title: 'Show me the fullscreen !', // change the title of the button, default Full Screen
    //         titleCancel: 'Exit fullscreen mode', // change the title of the button when fullscreen is on, default Exit Full Screen
    //         content: null, // change the content of the button, can be HTML, default null
    //         forceSeparateButton: true, // force separate button to detach from zoom buttons, default false
    //         forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
    //         fullscreenElement: false, // Dom element to render in full screen, false by default, fallback to map._container
    //     })
    //     .addTo(map)
    // transform geojson coordinates into an array of L.LatLng
    for (const element of coordinates) {
        latLngs.push(new L.LatLng(element[1], element[0]))
    }
    L.mask(latLngs).addTo(map)

    // var markers = new L.MarkerClusterGroup().addTo(map);
    const circles = []
    window.circles = circles
    // window['markers'] = markers;
    // TODO: process.env.NODE_ENV to replace constant localhost domain
    const socket = io('http://localhost:3000')
    const population = []
    socket.on('marker', (data) => {
        const { newMarker, newClusters } = data
        const circle = L.circle([newMarker._[0], newMarker._[1]], 6000)
        // const fixed = someColor(0);
        // circle.setStyle({fillColor: fixed, color: fixed, fillOpacity: 1,});
        circles.push(circle)
        refresh(circles, newClusters)
        if (circles.length === 15) {
            console.log('refreshing colors')
            circles.forEach((circle) => {
                const fixed = someColor(circle.cluster)
                circle.setStyle({ fillColor: fixed, color: fixed, fillOpacity: 1 })
                circle.addTo(map)
            })
        }
        population.push(newMarker)
    })

    // Refresh tiles after some time
    // because it doesn't load properly at first
    setTimeout(() => {
        map.invalidateSize()
    }, 300)
    return map
}
