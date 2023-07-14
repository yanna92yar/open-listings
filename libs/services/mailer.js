import MailTime from 'mail-time'
import { MongoClient } from 'mongodb'
import nodemailer from 'nodemailer'
import { NODE_ENV, config } from '../../utils.js'

/**
 * @class
 * Actual Mailer class. <br>
 * Note: not active when using NeDB in development mode. Because it relies on MongoDB.
 * It uses 'mail-time' library
 * @constructor
 * @public
 */
class MailerOps {
    constructor(db) {
        let mailQueue
        const transports = []
        // Outlook Apps SMTP
        transports.push(nodemailer.createTransport(config('SMTP')))
        if (db)
            mailQueue = new MailTime({
                db, // MongoDB
                type: 'server',
                strategy: 'balancer', // Transports will be used in round-robin chain
                transports,
                from(transport) {
                    // To pass spam-filters `from` field should be correctly set
                    // for each transport, check `transport` object for more options
                    return '"Classified ads" <' + transport.options.from + '>'
                },
                concatEmails: true, // Concatenate emails to the same addressee
                concatDelimiter: '<h1>{{{subject}}}</h1>', // Start each concatenated email with it's own subject
                template: MailTime.Template, // Use default template
                debug: NODE_ENV === 'api',
            })

        /**
         * Send an email with user defined language !
         *
         * @typedef {Object}
         * @property {String} to an email to send email to
         * @property {String} [subject] optional email subject
         * @property {String} [text] optional email text
         * @property {String} [html] optional email html
         * @public
         */
        this.sendMail = function ({ to, subject, text, html }) {
            if (!mailQueue) return
            mailQueue.sendMail({ to, subject, text, html })
        }
        /**
         * Send an email with user defined language !
         * 'subject', 'text', 'html' are derived from 'request' object
         *
         * @typedef {Object}
         * @property {String} to an email to send email to
         * @property {String} [todo] the action the doer is performing
         * @property {import('fastify').FastifyRequest} [req] request object to derive i18next translations
         * @property {Object} [data] key-values to inject to i18next} param0
         * @public
         */
        this.sendCustomMail = function ({ to, todo, req, data }) {
            if (!mailQueue) return
            // If req is provided we assume here that
            // a multilingual version exists and data is provided
            let subject, text, html
            if (req) {
                subject = req.t(`mail.${todo}.subject`, data)
                text = req.t(`mail.${todo}.text`, data)
                html = req.t(`mail.${todo}.html`, data)
                // req.log.info(`subject ${subject}`)
            }
            mailQueue.sendMail({ to, subject, text, html })
        }
    }
}

/**
 * @class
 * Factory class of 'MailerOps'. <br>
 * It instantiates a singleton with '#getInstance()'
 * @public
 */
class Mailer {
    constructor() {
        throw new Error('Use Mailer.getInstance()')
    }
    /**
     * Singleton Mailer instance
     * @param { String } mongoURL
     * @param { String } dbName
     * @returns { Promise <MailerOps> }
     */
    static async getInstance(mongoURL, dbName) {
        if (process.env['IS_MONGO_DB'] === 'false') {
            Mailer.instance = new MailerOps(null)
        }
        if (!Mailer.instance) {
            const client = await MongoClient.connect(mongoURL)
            const db = client.db(dbName)
            Mailer.instance = new MailerOps(db)
        }
        return Mailer.instance
    }
}

Mailer.instance = undefined
export default Mailer
