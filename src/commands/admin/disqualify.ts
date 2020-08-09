import { User } from '../../models/user.model';
import { Loser } from '../../models/losers.model';
import { Eliminated } from '../../models/eliminated.model';

const isEliminated = async (id: string) => await Eliminated.find({ discordId: id });

const findUser = async (client, userId) => {
    return await User.findOne({ discordId: userId }, err => {
        if (err) {
            client.logger.error(err);
        }
    });
};

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
        name, typeRacerLink,
        discordId, pastOpponents,
        avgWpm, rounds
    });

    return eliminatedUser.save(err => {
        if (err) {
            return msg.channel.send('An error occurred.');
        }

        return msg.channel.send(`<@${userId}> has been eliminated.`);
    });
};
