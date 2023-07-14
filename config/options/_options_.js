import corsOptions from './cors.js'
import helmet from './helmet.js'
import logger from './logger.js'
import swaggerUI from './swagger-ui.js'
import swagger from './swagger.js'

const options = { helmet, corsOptions, logger, swagger, swaggerUI }
export { options }

