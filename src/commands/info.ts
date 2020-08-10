import { MessageEmbed } from 'discord.js';
import { colors, version } from '../config/config';
import { Tournament } from '../models/tournament.model';

const createLeaderboard = stats => {
    let leaderboardString = '';

    if (!stats) {
        return 'N/A';
    }

    stats.forEach((user, index) => {
        const { name, typeRacerLink, avgWpm } = user;
        leaderboardString += `\n**#${index + 1}** **[${name}](${typeRacerLink})** - **${Math.round(avgWpm * 100) / 100}**wpm`;
    });

    return leaderboardString || 'N/A';
};

export default async (msg, client, args) => {
    const tournamentInfo = await Tournament.find({ isOpen: true }, err => {
        if (err) {
            client.logger.error(err);
        }
    });

    const {
        title, currentRound, participants,
        leaderboard, isOpen
    } = tournamentInfo[0];

    const infoEmbed = new MessageEmbed()
        .setColor(colors.green)
        .setAuthor(`${title}`, msg.author.avatarURL())
        .setTimestamp(new Date())
        .setFooter(`EventsBot v${version}`)
        .addField('Participants', participants, true)
        .addField('Current Round', currentRound, true)
        .addField('Registration', (isOpen) ? 'Open' : 'Closed', true)
        .addField('Leaderboard', createLeaderboard(leaderboard));

    return msg.channel.send(infoEmbed);
};
