import { User } from '../../models/user.model'
import { Loser } from '../../models/losers.model'
import { Eliminated } from '../../models/eliminated.model'

const isEliminated = async (id: string) => await Eliminated.findOne({ discordId: id })

const findUser = async (client, args) => {
    const userId: string = args[0].replace(/<|@|!|>/g, '')
    return await User.findOne({ discordId: userId }, err => {
        if (err) {
            client.logger.error(err)
        }
    })
}

export default async (msg, client, args) => {
    if (!args[0]) {
        return msg.channel.send('No user found: `/disqualify <user-id>`')
    }

    if (isEliminated(userId)) {
        return msg.channel.send('This user is already eliminated!')
    }

    const user = await findUser(client, args)
    const { 
        name, typeRacerLink, discordId, 
        pastOpponents, avgWpm, losses, rounds 
    } = user
    const eliminated = new Eliminated({
        date: new Date(),
        losses: 2,
        name, typeRacerLink,
        discordId, pastOpponents,
        avgWpm, rounds
    })

    return eliminated.save(err => {
        if (err) {
            return msg.channel.send('An error occurred.')
        }

        return User.updateOne({ discordId: userId }, {
            losses: 2
        })
    })
}
