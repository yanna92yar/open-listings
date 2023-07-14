import L from 'leaflet'

/**
 * TODO: generate marker color by section
 * @returns
 */
export function getIcon(defaultColor = '#583470') {
    const markerHtmlStyles = `
        background-color: ${defaultColor};
        width: 1rem;
        height: 1rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        transform: rotate(45deg);
        border: 1px solid #000000`

    const icon = L.divIcon({
        className: 'my-custom-pin',
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles}" />`,
    })

    return icon
}
