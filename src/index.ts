const Discord = require('discord.js')
const mongoDB = require('mongodb')
const mongoose = require('mongoose')
import * as dotenv from 'dotenv'
import { initDatabase } from './db/init'
import { functions } from './modules/functions'

const client: any = new Discord.Client({
    disableEveryone: true,
    fetchAllMembers: true,
    sync: true
})

dotenv.config()
functions(client)

client.config = require('./config/config.js')
client.loader = require('./modules/Loader')

const URI: string = process.env.URI
const URIParams: {} = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const init = async () => {
    const {
        registerModules,
        registerEvents,
        checkDiscordStatus
    } = client.loader

    console.clear()
    await registerModules(client)
    await registerEvents(client)
    await checkDiscordStatus(client)
    await client.login(process.env.TOKEN)
    
    return initDatabase(client);
}

init();
