import { MessageEmbed } from 'discord.js';
import { colors, version } from '../config/config';
import { MatchLog } from '../models/matchlog.model';

// The sort type is the property of users that the function sorts by
const sortLogs = (logs: any[], sortType: string) => {
    return logs.sort((a, b) => {
        return (a[sortType] < b[sortType]) ? 1 : (
            (b[sortType] < a[sortType]) ? -1 : 0
        );
    });
};

const formatDate = dateString => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return `${month}/${day}`;
};

const createLogs = async pageNum => {
    const logs = await MatchLog.find();
    const sortedLogs = sortLogs(logs, 'date');
    const pageLog = sortedLogs.slice((pageNum - 1) * 10, ((pageNum - 1) * 10) + 9);
    let description = '';

    pageLog.forEach((log, i) => {
        const { 
            date, winnerId, winnerWpm, winnerScore, 
            loserId, loserWpm, loserScore 
        } = log;
        
        description += `\n${formatDate(date)}: <@${winnerId}> won vs. <@${loserId}> • **${winnerScore}** vs. **${loserScore}** • **${winnerWpm}**wpm vs. **${loserWpm}**wpm`;
    });
    
    return description;
};

const sendInvalidError = (msg, embed, error) => {
    embed
        .setColor(colors.yellow)
        .setDescription(error);

    return msg.channel.send(embed);
};

const getPageCount = async () => {
    const logs = await MatchLog.find();
    return Math.ceil(logs.length / 10);
};

export default async (msg, client, args) => {
    const logEmbed = new MessageEmbed()
        .setColor(colors.green)
        .setAuthor('Match Logs', msg.author.avatarURL())
        .setTimestamp(new Date());

    if (args[0] && !parseInt(args[0])) {
        return sendInvalidError(msg, logEmbed, 'Invalid page number.');
    }

    const pageNumber: number = parseInt(args[0]) || 1;
    const pageCount: number = await getPageCount();

    if (!pageCount) {
        return sendInvalidError(msg, logEmbed, 'No logs found.');
    }

    if (pageNumber > pageCount) {
        return sendInvalidError(msg, logEmbed, 'Invalid page number.');
    }
        
    logEmbed
        .setDescription(await createLogs(pageNumber))
        .setFooter(`Page ${pageNumber}/${pageCount} • EventsBot v${version}`);
    
    return msg.channel.send(logEmbed);
};
