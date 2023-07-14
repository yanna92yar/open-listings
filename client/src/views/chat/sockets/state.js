export const clientSocket = {
    notesChannel: __channel__,
    addressedChannel: __channel__,
    addressedId: __channel__.slice(0, 8) + __channel__.slice(-2),
    thread: __id__,
    sockets: [],
    messages: {},
}
