const fetch = require('node-fetch')
import { User } from '../models/user.model'
import { Tournament } from '../models/tournament.model'

const urlExists = async (url: string) => {
    return await fetch(url)
        .then((res: { text: () => any }) => res.text())
        .then((res: string | string[]) => res.includes('(TypeRacer Profile)'))
}

const registerUser = (msg, ntLink: string) => {
    const user = new User({
        date: new Date(),
        name: msg.author.username,
        typeRacerLink: ntLink,
        discordId: msg.author.id
    })
    user.save((err: any) => msg.reply((err)
        ? 'Error creating account. Contact LeSirH!' 
        : 'Success! See `/help`.'
    ))
}

export default async (msg, client, args) => {
    const tournamentInfo = await Tournament.find({ isOpen: true }, err => {
        if (err) {
            client.logger.error(err)
        }
    })

    if (!tournamentInfo[0].isOpen) {
        return msg.reply('Registration is closed.')
    }

    if (!args[0]) {
        return msg.reply('Use your TypeRacer **username** (NOT display name): Use `/register USERNAME`.')
    }

    // Check if the user already has an account
    const userExists = await User.findOne({ discordId: msg.author.id })

    if (userExists) {
        return msg.reply('You already have an account!')
    }

    // Check if someone is already registered with this NitroType link
    const linkExists: any = await User.findOne({ nitroTypeLink: args[0] })
    if (linkExists) {
        return msg.reply('Someone is already registered with this account!')
    }

    const link: string = (args[0].includes('data.typeracer.com/pit/profile?user='))
        ? args[0]
        : `https://data.typeracer.com/pit/profile?user=${args[0]}`

    const trLinkExists: boolean = await urlExists(link)
    return (trLinkExists)
        ? registerUser(msg, link)
        : msg.reply('Invalid TypeRacer profile link!')
}