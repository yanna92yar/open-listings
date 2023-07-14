import { getChannels, newSocket, recoverState } from './sockets/refresh.js'

recoverState()
if (newSocket()) getChannels()
