// import * as colorette from 'colorette'

// Used as a safe method, as we don't want any problem occuring on the logger
// for example after some breaking changes etc.
const toIgnore = ['/locales/', '/geo/', '/javascripts/', '/stylesheets/', '/images/']
const requestSerializer = (request) => {
    try {
        const ignored = toIgnore.find(url => request.url.indexOf(url) > -1)
        if (ignored) return false

        const requestSerializer = {
            method: request.method,
            url: request.url,
            ...(request.headers['user-agent'] && {
                useragent: request.headers['user-agent'].slice(0, 100),
            }),
            hostname: request.socket.hostname,
            remoteAddress: request.socket.ip,
            remotePort: request.socket.remotePort,
            ingest: 'fluentd',
        }
        return requestSerializer
    } catch (error) {
        return {
            method: request.method,
            url: request.url,
            path: request.routerPath,
            parameters: request.params,
        }
    }
}

export default () => {
    return {
        file: './logs/all.log',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        serializers: {
            req(request) {
                return requestSerializer(request)
            },
        },
    }
    // return process.env.NODE_ENV === 'api'
    //     ? {
    //           transport: {
    //               target: 'pino-pretty',
    //               options: {
    //                   translateTime: 'HH:MM:ss Z',
    //                   ignore: 'pid,hostname',
    //               },
    //           },
    //           level: 'info',
    //           colorize: colorette.isColorSupported, // --colorize
    //           colorizeObjects: true,
    //           customColors: 'err:red,info:blue',
    //       }
    //     : {
    //           file: './logs/all.log',
    //           redact: ['req.headers.authorization', 'req.headers.cookie'],
    //           serializers: {
    //               req(request) {
    //                   return requestSerializer(request)
    //               },
    //           },
    //       }
}
