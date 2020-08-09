// database connection
const mongoDB = require('mongodb');
const mongoose = require('mongoose');
const logger = require('../modules/Logger');
const { uriParams } = require('../config/config');

const defaultUri = 'mongodb://localhost:27017/events-bot'

const initDatabase = (client: any) => {
    mongoDB.connect(process.env.URI, uriParams, err => {
        if (err) {
            return client.logger.error(err)
        }

        return client.logger.ready('Successfully connected to database.')
    })

    mongoose.connect(process.env.URI, uriParams, err => {
        if (err) {
            client.logger.error(err)
        }
    })
};

export { initDatabase }
