import { LIS } from '../../../helpers/lis.js'
import { newSocket } from '../sockets/refresh.js'
import { clientSocket } from '../sockets/state.js'

const { addressedChannel, addressedId, messages, sockets } = clientSocket
const list = LIS.id('message-list')
const id = (channel) => channel.slice(0, 8) + channel.slice(-2)
const append = (msg) => {
    const li = document.createElement('li')
    li.innerHTML = `<b>${msg.sender}:&nbsp;</b>${msg.message}`
    list.appendChild(li)
}
// On click event and having the complete list
// focus the channel clicked and un-focus others.
// localStorage -> messages -> UI
export const channelSelect = (channel, ul) => {
    return function (event) {
        let lies = ul.getElementsByTagName('li')
        for (var i = 0; i < lies.length; ++i) {
            lies[i].innerHTML = lies[i].innerHTML.replace('<b>', '').replace('</b>', '')
        }
        let li = event.target
        li.innerHTML = `<b>${li.innerHTML}</b>`
        addressedChannel = channel
        addressedId = id(channel)
        if (localStorage.getItem(addressedId)) messages[addressedId].push(JSON.parse(localStorage.getItem(addressedId)))
        // Make socket, fill messages and append
        if (!sockets[addressedId]) newSocket()
        else {
            // get earlier messages and append
            messages[addressedId].forEach((message) => {
                append(message)
            })
        }
    }
}
