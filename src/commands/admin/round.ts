import { User } from '../../models/user.model';
import { Loser } from '../../models/losers.model';
import { Tournament } from '../../models/tournament.model';
import disqualify from './disqualify';
import { default as officiate } from './officiate';

// Sorted by average WPM speed
const createSeed = users => users.sort((a, b) => (a.avgWpm > b.avgWpm) ? 1 : -1);

const updateRoundCount = async (client) => {
    const tournInfo = await Tournament.find();
    const { currentRound } = tournInfo[0];

    await Tournament.updateOne({ __v: 0 }, {
        currentRound: parseInt(currentRound) + 1
    });

    return client.logger.ready('A new round has started.');
}

// args: <@winner> <winner_score> <winner_wpm> <@loser> <loser_score> <loser_wpm>
const officiateDisqualified = async (msg, client, bracket) => {
    for (let user of bracket) {
        if (user.disqualified && user.opponent) {
            await officiate(msg, client, [
                user.opponent.discordId, '0', '0', 
                user.discordId, '0', '0'
            ]);
        }
    }
}

const pair = async (users, client, msg) => {
    const seeds = createSeed(users);

    if (seeds.length === 0) return;

    for (let i = 0; i < seeds.length; i++) {
        const ID: any = { discordId: seeds[i].discordId };
        const newOpponent: any = seeds[(i % 2 === 0) ? i + 1 : i - 1];

        await User.updateOne(ID, {
            opponent: {
                discordId: newOpponent.discordId,
                avgWpm: newOpponent.avgWpm
            }
        }, err => {
            if (err) {
                return client.logger.error(err);
            }
        });
    }

    return msg.channel.send('A bracket has been updated. 2 should update.');
};

export default async (msg, client, args) => {
    const winners = await User.find({ losses: 0 });
    const losers = await User.find({ losses: 1 });

    await pair(winners, client, msg);
    await pair(losers, client, msg);

    await officiateDisqualified(msg, client, losers);
    await officiateDisqualified(msg, client, winners);

    return await updateRoundCount(client);
};
