import { MessageEmbed } from 'discord.js';
import { colors, version } from '../../config/config';
import { User } from '../../models/user.model';
import { Tournament } from '../../models/tournament.model';

const formatBracket = async bracket => {
    const tournamentInfo = await Tournament.find();
    const { currentRound } = tournamentInfo[0];

    let description = '';

    for (const user of bracket) {
        if (user && user.opponent) {
            if (user.rounds < currentRound && !description.includes(user.opponent.discordId)) {
                description += `\n**<@${user.discordId}>** vs. **<@${user.opponent.discordId}>**`;
            }
        }
    }

    return description;
};

export default async (msg, client, args) => {
    const statusEmbed = new MessageEmbed()
        .setColor(colors.green)
        .setAuthor('Status', msg.author.avatarURL())
        .setTimestamp(new Date())
        .setFooter(`EventsBot v${version}`);

    const winners = await User.find({ losses: 0 });
    const losers = await User.find({ losses: 1 });

    const winnersDescription = await formatBracket(winners);
    const losersDescription = await formatBracket(losers);

    statusEmbed
        .addField('Winners', winnersDescription || 'None')
        .addField('Losers', losersDescription || 'None');

    return msg.channel.send(statusEmbed);
};
