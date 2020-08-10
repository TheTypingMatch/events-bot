import { User } from '../models/user.model';
import { MessageEmbed } from 'discord.js';
import { helpInfo } from '../config/embeds';
import { colors, version } from '../config/config';

const formatOpponents = pastOpponents => {
    if (pastOpponents.length === 0) {
        return 'None';
    }

    let formattedOpponents = '';
    pastOpponents.forEach((opp, i) => {
        if (i === pastOpponents.length - 1) {
            return formattedOpponents += `${(i > 0) ? '& ' : ''}<@${opp}>`;
        }

        return formattedOpponents += `<@${opp}>, `;
    });

    return formattedOpponents;
};

export default async (msg, client, args) => {
    const statsEmbed = new MessageEmbed()
        .setColor(colors.red)
        .setAuthor('This user was not found.')
        .setTimestamp(new Date())
        .setFooter(`EventsBot v${version}`);

    const userId = (args[0]) ? args[0].replace(/<|@|!|>/g, '') : msg.author.id;
    const user = await User.findOne({ discordId: userId });

    if (!user) {
        return msg.channel.send(statsEmbed);
    }

    const {
        name, typeRacerLink, avgWpm,
        wins, rounds, losses, pastOpponents,
        opponent
    } = user;

    statsEmbed
        .setColor(colors.green)
        .setAuthor(`${name}'s Stats`, msg.author.avatarURL())
        .setDescription(`[**TypeRacer**](${typeRacerLink})`)
        .addField('Status', (losses !== 0)
            ? (losses === 1)
                ? 'Loser\'s Bracket'
                : 'Eliminated'
            : 'Winner\'s Bracket'
        )
        .addField('Avg. WPM', `**${Math.round(avgWpm * 100) / 100}**wpm`, true)
        .addField('\u200b', '\u200b', true)
        .addField('Round Wins', `**${rounds - losses}** wins`, true)
        .addField('Past Opponents', formatOpponents(pastOpponents), true)
        .addField('\u200b', '\u200b', true)
        .addField('Current Pairing', (opponent) ? `<@${opponent.discordId}> - **${Math.round(opponent.avgWpm * 100) / 100}**wpm` : 'N/A', true);

    return msg.channel.send(statsEmbed);
};
