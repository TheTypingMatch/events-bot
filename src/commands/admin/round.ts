const User = require('../models/user.model')

const pair = (users, client, msg) => {
    const seeds = users.sort((a, b) => (a.avgWpm > b.avgWpm) ? 1 : -1)

    /*

        1. Make fair pairings
        2. Add pairings to user models

    */

    return msg.reply('This command is in development.')
}

export default (msg, client, args) => {
    return User.find({ eliminated: false })
        .then(data => pair(data, client, msg))
}
