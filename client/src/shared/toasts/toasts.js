import { Notyf } from 'notyf'

const __errors__ = window.__errors__
const __successes__ = window.__successes__
const __announcements__ = window.__announcements__

export const runToasts = async () => {
    const notyfInfo = new Notyf({ types: [{ type: 'info', background: 'blue', icon: false, duration: 9000 }] })
    document.body.addEventListener('htmx:afterRequest', function (evt) {
        if (evt.detail.xhr.readyState === XMLHttpRequest.DONE) {
            if (evt.detail.xhr.status === 500) {
                // evt.detail.shouldSwap = true;
                evt.detail.isError = true
                // console.log(JSON.stringify(evt.detail.xhr))
                // TODO: Why is evt.detail.xhr.response.error String when "application/json; charset=utf-8" is set on server side ?!
                if (
                    evt.detail.xhr.response &&
                    typeof evt.detail.xhr.response === 'string' &&
                    evt.detail.xhr.response.indexOf('error') >= 0
                ) {
                    let errors = JSON.parse(evt.detail.xhr.response).error
                    errors.forEach((error) => {
                        notyfInfo.error(error)
                    })
                }
            }
        }
    })

    __errors__.forEach((error) => {
        notyfInfo.error(error)
    })
    __successes__.forEach((success) => {
        notyfInfo.success(success)
    })
    const sometimes = Math.random() < 0.5
    if (__announcements__ && sometimes) {
        __announcements__.forEach((info) => {
            notyfInfo.open({ type: 'info', message: info })
        })
    }
    return '### function "runToasts" run successfully'
}
