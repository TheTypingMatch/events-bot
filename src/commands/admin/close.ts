import { MessageEmbed } from 'discord.js';
import { colors, version } from '../../config/config';
import { Tournament } from '../../models/tournament.model';

export default async (msg, client, args) => {
    const statusEmbed = new MessageEmbed()
        .setColor(colors.green)
        .setAuthor('Registration', msg.author.avatarURL())
        .setTimestamp(new Date())
        .setFooter(`EventsBot v${version}`)
        .setDescription('Registration has been closed.');

    client.logger.ready('Registration has been closed.');
    Tournament.updateOne({ __v: 0 }, { isOpen: false });
    return msg.channel.send(statusEmbed);
};
