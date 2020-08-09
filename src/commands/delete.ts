import { User } from '../models/user.model'
import { MessageEmbed } from 'discord.js'
import { colors, version } from '../config/config'

const deleteEmbed = new MessageEmbed()
    .setTimestamp(new Date())
    .setFooter(`EventsBot v${version}`)
    .setDescription('Your data has been deleted.')

const deleteData = async (id, msg) => {
    await User.deleteOne({ discordId: id })
    return msg.channel.send(deleteEmbed)
}

export default async (msg, client, args) => {
    const error: string = 'You must type your Discord name: `/delete <discord-id>`'

    const userId: string = args[0]
    const user: any = await User.findOne({ discordId: msg.author.id })

    deleteEmbed.setAuthor('Delete', msg.author.avatarURL())

    return (userId && userId === user.discordId)
        ? deleteData(msg.author.id, msg)
        : msg.reply(error)
}
