import { User } from '../../models/user.model';
import { Loser } from '../../models/losers.model';
import { Tournament } from '../../models/tournament.model';

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

const pair = (users, client, msg, model) => {
    const seeds = createSeed(users);

    for (let i = 0; i < seeds.length; i++) {
        const ID: any = { discordId: seeds[i].discordId };
        const newOpponent: any = seeds[(i % 2 === 0) ? i + 1 : i - 1];

        model.updateOne(ID, {
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

    return msg.reply('A bracket has been updated. 2 should update.');
};

export default async (msg, client, args) => {
    const winners = await User.find();
    const losers = await Loser.find();

    pair(winners, client, msg, User);
    pair(losers, client, msg, Loser);

    return await updateRoundCount(client);
};
