import { config } from '../../utils.js'

export default {
    
    swagger: {
        mode: 'dynamic',
        info: {
            title: 'Open-listings API',
            description: '',
            version: '1.0.0'
        },
        externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here'
        },
        host: `localhost:${ config('NODE_PORT')}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
}