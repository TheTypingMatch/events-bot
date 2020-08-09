import { User } from '../../models/user.model'
import { Loser } from '../../models/losers.model'

// Sorted by average WPM speed
const createSeed = users => users.sort((a, b) => (a.avgWpm > b.avgWpm) ? 1 : -1)

const pair = (users, client, msg, model) => {
    const seeds = createSeed(users)

    for (let i = 0; i < seeds.length; i++) {
        let ID: any = { discordId: seeds[i].discordId }
        let newOpponent: any = seeds[(i % 2 === 0) ? i + 1 : i - 1]

        model.updateOne(ID, {
            opponent: {
                discordId: newOpponent.discordId,
                avgWpm: newOpponent.avgWpm
            }
        }, err => {
            if (err) {
                return client.logger.error(err)
            }
        })
    }

    return msg.reply('A bracket has been updated. 2 should update.')
}

export default async (msg, client, args) => {
    const winners = await User.find()
    const losers = await Loser.find()

    pair(winners, client, msg, User)
    return pair(losers, client, msg, Loser)
}
