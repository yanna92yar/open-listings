import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const toBeReplaced = '42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com'

/**
 * @return {Object}
 */
export default () => {
    // TODO: Remove "'unsafe-eval'" again. It is left for client side EJS rendering
    return {
        referrerPolicy: { policy: "same-origin" },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'same-site' },
        contentSecurityPolicy: {
            directives: {
                ...require('@fastify/helmet').contentSecurityPolicy.getDefaultDirectives(),
                'default-src': [
                    "'self'",
                    "'unsafe-eval'",
                    'fonts.googleapis.com',
                    '*.fontawesome.com',
                    'www.googleapis.com',
                    'app.zingsoft.com',
                    'raw.githubusercontent.com',
                    'https://*.mapbox.com',
                    toBeReplaced,
                ],
                'style-src': [
                    "'self'",
                    "'unsafe-inline'",
                    'unpkg.com',
                    'cdn.jsdelivr.net',
                    'fonts.googleapis.com',
                    '*.fontawesome.com',
                    'maxcdn.bootstrapcdn.com',
                    'cdn.datatables.net',
                ],
                'script-src': [
                    "'self'",
                    "'unsafe-eval'",
                    'unpkg.com',
                    '*.fontawesome.com',
                    'cdn.jsdelivr.net',
                    'cdn.zinggrid.com',
                    'cdnjs.cloudflare.com',
                    'cdn.datatables.net',
                    "'unsafe-inline'",
                ], // "localhost:3002" Ackee tracker test
                'img-src': [
                    "'self'",
                    'data:',
                    '*.tile.osm.org',
                    'via.placeholder.com',
                    'unpkg.com',
                    'live.staticflickr.com',
                    'storage.googleapis.com',
                    'cdn.datatables.net',
                    'icongr.am',
                    toBeReplaced,
                ],
                'font-src': [
                    "'self'",
                    'fonts.googleapis.com',
                    'fonts.gstatic.com',
                    '*.fontawesome.com',
                    'maxcdn.bootstrapcdn.com',
                ],
            },
        },
        // TODO: revise policies
        global: true,
    }
}
