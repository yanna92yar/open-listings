// Configuration

export const consts = {
    APIHost: {
        production: '',
        localhost: 'http://localhost:3000',
    },
    // { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "SILENT": 5};
    logLevel: {
        production: 2,
        development: 1,
        localhost: 0,
    },
    tagSize: 35,
}
