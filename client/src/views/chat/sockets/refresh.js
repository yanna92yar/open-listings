import { LIS } from '../../../helpers/lis.js'
import { channelSelect } from '../helpers/dom.js'
import { clientSocket } from './state.js'

const { addressedChannel, addressedId, notesChannel, sockets, thread, messages } = clientSocket
const list = LIS.id('message-list')
const id = (channel) => channel.slice(0, 8) + channel.slice(-2)
const append = (msg) => {
    const li = document.createElement('li')
    li.innerHTML = `<b>${msg.sender}:&nbsp;</b>${msg.message}`
    list.appendChild(li)
}
const endpoint = `ws://${window.location.host}/chat/ping/?channel=`

// Create new Socket: assumes localStorage & messages does not contain earlier messages (discarded)
export const newSocket = () => {
    try {
        sockets[addressedId] = new WebSocket(endpoint + addressedChannel)
        sockets[addressedId].onerror = function (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
        return false
    }

    // message -> messages -> localStorage
    // message -> UI
    sockets[addressedId].onmessage = (response) => {
        try {
            let message = JSON.parse(response.data)
            if (!messages[addressedId]) messages[addressedId] = [message]
            else messages[addressedId].push(message)
            localStorage.setItem(addressedId, JSON.stringify(messages[addressedId]))
            append(message)
        } catch (error) {
            console.log(error)
        }
    }

    // Sender UI is treated as other users. He/She will we receiving messages by socket server
    LIS.id('messenger').addEventListener('keyup', (e) => {
        if (e.key === 'Enter' /* || e.keyCode === 13 */) {
            sockets[addressedId].send(JSON.stringify({ message: e.target.value }))
            e.target.value = ''
        }
    })
    return true
}
/**
 * GET one new channel at least or all channels for the current logged viewer.
 * If the viewer is author, then gets all channels for the current thread (other viewers)
 * If not, then get the unique channel between the viewer and the author for the current thread
 */
export const getChannels = () => {
    const channels = LIS.id('channels')
    if (channels) {
        fetch(`/listings/id/${thread}/channels`)
            .then((response) => response.json())
            .then((data) => {
                let ul = LIS.id('channels box')
                data.channels.forEach((channel) => {
                    let li = document.createElement('li')
                    if (channel === notesChannel) li.style = 'color: red'
                    li.appendChild(document.createTextNode(id(channel)))
                    li.addEventListener('click', channelSelect(channel, ul), false)
                    ul.appendChild(li)
                })
                data.readableChannels.forEach((channel) => {
                    let li = document.createElement('li')
                    if (channel === notesChannel) li.style = 'color: red'
                    li.appendChild(document.createTextNode(id(channel)))
                    li.addEventListener('click', channelSelect(channel, ul), false)
                    ul.appendChild(li)
                })
                console.log(`channels ${data}`)
            })
    }
}

export const recoverState = () => {}
