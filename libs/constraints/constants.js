// new_listing"|"send_message|login|subscribe|search

const Actions = {
    new_listing: { type: 'new_listing', w: 5 },
    send_message: { type: 'send_message', w: 2 },
    login: { type: 'login', w: 0 },
    subscribe: { type: 'subscribe', w: 1 },
    reset: { type: 'reset', w: 0 },
    confirmation: { type: 'confirmation', w: 1 },
    gwooglSearch: { type: 'gwooglSearch', w: 1 },
    geoSearch: { type: 'geoSearch', w: 1 },
}

export { Actions }
