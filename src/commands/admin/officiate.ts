import { User } from '../../models/user.model';
import { Loser } from '../../models/losers.model';
import { Eliminated } from '../../models/eliminated.model';
import { MatchLog } from '../../models/matchlog.model';

const cmdInfo = '```/officiate <@winner> <winner_score> <winner_wpm> <@loser> <loser_score> <loser_wpm>```';

const createPairingInfo = (id, score, avgWpm) => {
    return {
        id: id.replace(/<|@|!|>/g, ''),
        score: parseInt(score),
        avgWpm: parseFloat(avgWpm)
    };
};

const updateUser = async (id, info) => await User.updateOne({ discordId: id }, info);

const updateLeaderboard = async (client) => await client.refreshLeaderboard();

const updateLogs = async (winnerInfo, loserInfo) => {
    const log = new MatchLog({
        date: new Date(),
        winnerId: winnerInfo.id,
        winnerWpm: winnerInfo.avgWpm,
        winnerScore: winnerInfo.score,
        loserId: loserInfo.id,
        loserWpm: loserInfo.avgWpm,
        loserScore: loserInfo.score
    });
    
    log.save(err => {
        if (err) {
            throw new Error('Unable to save match log.');
        }
    });
};

const eliminateUser = async id => {
    const user = await User.findOne({ discordId: id });
    
    if (user.losses >= 2) {
        const isEliminated = await Eliminated.findOne({ discordId: id });
        
        if (isEliminated) {
            const { 
                date, name, typeRacerLink, 
                discordId, opponent, pastOpponents, 
                avgWpm, losses, rounds, disqualified 
            } = user

            const eliminatedUser = new Eliminated({
                date, name, typeRacerLink, 
                discordId, opponent, pastOpponents, 
                avgWpm, losses, rounds, disqualified 
            });

            return eliminatedUser.save();
        }
    }
}

export default async (msg, client, args) => {
    for (const arg of args) {
        if (isNaN(arg.toString().replace(/<|@|!|>/g, ''))) {
            return msg.reply(`One of the arguments provided is incorrect.${cmdInfo}`);
        }
    }

    const winnerInfo = createPairingInfo(args[0], args[1], args[2]);
    const loserInfo = createPairingInfo(args[3], args[4], args[5]);
    const winnerStats = await User.findOne({ discordId: winnerInfo.id });
    const loserStats = await User.findOne({ discordId: loserInfo.id });

    if (!winnerStats || !loserStats) {
        return msg.reply('One or both of these users were not found.');
    }

    if (!winnerStats.opponent || !loserStats.opponent) {
        return msg.reply('One or both of these users don\'t have pairings.')
    }

    if (winnerStats.opponent.discordId !== loserStats.discordId) {
        return msg.reply('These users don\'t seem to be paired.')
    }

    try {
        await updateLogs(winnerInfo, loserInfo);
    } catch (err) {
        msg.reply('An error occurred updating the logs!');
        return client.logger.error(err);
    }
    
    await updateUser(winnerInfo.id, {
        rounds: winnerStats.rounds + 1,
        avgWpm: (winnerStats.rounds !== 0) 
            ? ((winnerStats.avgWpm * winnerStats.rounds) + winnerInfo.avgWpm) / (winnerStats.rounds + 1) 
            : winnerInfo.avgWpm,
        pastOpponents: [...winnerStats.pastOpponents, loserInfo.id],
        opponent: undefined
    });

    await updateUser(loserInfo.id, {
        rounds: loserStats.rounds + 1,
        losses: loserStats.losses + 1,
        avgWpm: (loserInfo.avgWpm) 
            ? ((loserStats.avgWpm * loserStats.rounds) + loserInfo.avgWpm) / (loserStats.rounds + 1) 
            : winnerStats.avgWpm,
        pastOpponents: [...loserStats.pastOpponents, winnerInfo.id],
        opponent: undefined
    });

    await eliminateUser(loserInfo.id);
    await updateLeaderboard(client);
    return msg.reply('A match has been officiated.');
};

/*

    /officiate <@winner> <winner_score> <winner_wpm> <@loser> <loser_score> <loser_wpm>

*/
