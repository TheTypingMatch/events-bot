import { default as officiate } from './officiate';
import { User } from '../../models/user.model';
import { Loser } from '../../models/losers.model';
import { Tournament } from '../../models/tournament.model';
import disqualify from './disqualify';

const shuffle = arr => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

// Sorted by average WPM speed
const createSeed = users => {
    const tempUsers = users;
    const brackets = [[], []];
    const speedSortedUsers = tempUsers.sort((a, b) => (a.avgWpm > b.avgWpm) ? 1 : -1);

    const addBracket = (bracketNum, overwrite) => {
        const user1 = speedSortedUsers[0];
        const user2 = speedSortedUsers[1];

        if (overwrite === 'overwrite') {
            brackets[bracketNum].push(speedSortedUsers.shift());
            brackets[bracketNum].push(speedSortedUsers.shift());
        } else if (user1.avgWpm - user2.avgWpm > 10 || user1.avgWpm - user2.avgWpm < -10) {
            brackets[bracketNum].push(speedSortedUsers.shift());
            brackets[bracketNum].push(speedSortedUsers.shift());
        }
    };

    let i = 0;
    while (speedSortedUsers.length) {
        addBracket(i % brackets.length, (i > 0) ? 'overwrite' : '');
        i += 1;
    }

    shuffle(brackets);
    return [...brackets[0], ...brackets[1]];
};

const updateRoundCount = async (client) => {
    const tournInfo = await Tournament.find();
    const { currentRound } = tournInfo[0];

    await Tournament.updateOne({ __v: 0 }, {
        currentRound: parseInt(currentRound) + 1
    });

    return client.logger.ready('A new round has started.');
};

// args: <@winner> <winner_score> <winner_wpm> <@loser> <loser_score> <loser_wpm>
const officiateDisqualified = async (msg, client, bracket) => {
    for (const user of bracket) {
        if (user.disqualified && user.opponent) {
            await officiate(msg, client, [
                user.opponent.discordId, '0', '0', 
                user.discordId, '0', '0'
            ]);
        }
    }
};

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

    const disqualifiedWinners = winners.filter(user => (user.disqualified && user.opponent));
    const disqualifiedLosers = losers.filter(user => (user.disqualified && user.opponent));

    await pair(winners, client, msg);
    await pair(losers, client, msg);

    await officiateDisqualified(msg, client, disqualifiedLosers);
    await officiateDisqualified(msg, client, disqualifiedWinners);

    return await updateRoundCount(client);
};
