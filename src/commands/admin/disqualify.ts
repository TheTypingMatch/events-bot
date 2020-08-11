import { User } from '../../models/user.model';
import { Loser } from '../../models/losers.model';
import { Eliminated } from '../../models/eliminated.model';
import { default as officiate } from '../admin/officiate';

const isEliminated = async (id: string) => await Eliminated.find({ discordId: id });

const findUser = async (client, userId) => {
    return await User.findOne({ discordId: userId }, err => {
        if (err) {
            client.logger.error(err);
        }
    });
};

const officiateDisqualified = async (msg, client, user) => {
    if (user.opponent) {
        return await officiate(msg, client, [
            user.opponent.discordId, '0', '0', 
            user.discordId, '0', '0'
        ]);
    }
}

export default async (msg, client, args) => {
    if (!args[0]) {
        return msg.channel.send('No user found: `/disqualify <user-id>`');
    }

    const userId: string = args[0].replace(/<|@|!|>/g, '');
    const eliminated = await isEliminated(userId);
    if (eliminated.length !== 0) {
        return msg.channel.send('This user is already eliminated!');
    }

    const user = await findUser(client, userId);
    const { 
        name, typeRacerLink, discordId, 
        pastOpponents, avgWpm, losses, rounds 
    } = user;
    const eliminatedUser = new Eliminated({
        date: new Date(),
        losses: 2,
        disqualified: true,
        name, typeRacerLink,
        discordId, pastOpponents,
        avgWpm, rounds
    });

    eliminatedUser.save(err => {
        if (err) {
            return msg.channel.send('An error occurred.');
        }

        return msg.channel.send(`<@${userId}> has been disqualified. They will be auto-officiated in future rounds.`);
    });

    await User.updateOne({ discordId: userId }, { disqualified: true });
    return await officiateDisqualified(msg, client, user);
};
