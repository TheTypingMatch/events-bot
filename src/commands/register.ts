const fetch = require('node-fetch');
import { User } from '../models/user.model';
import { Tournament } from '../models/tournament.model';

const urlExists = async (url: string) => {
    return await fetch(url)
        .then((res: { text: () => any }) => res.text())
        .then((res: string | string[]) => res.includes('(TypeRacer Profile)'));
};

const updateParticipantCount = async () => {
    const users = await User.find();

    return Tournament.updateOne({ __v: 0 }, { participants: users.length });
};

const fetchAverage = async (url: string) => {
    return fetch(url)
        .then(res => res.text())
        .then(res => {
            const nums = [];
            const userData = res.split(' ');

            for (const data of userData) {
                if (parseInt(data) && !isNaN(data)) {
                    nums.push(parseInt(data));
                }
            }

            return nums[1];
        }).catch(err => 0);
};

const registerUser = async (msg, trLink: string) => {
    const defaultWpm = await fetchAverage(trLink);

    const user = new User({
        date: new Date(),
        name: msg.author.username,
        typeRacerLink: trLink,
        discordId: msg.author.id,
        avgWpm: defaultWpm
    });

    user.save(async (err: any) => {
        if (err) {
            return msg.reply('An error occurred. Contact <@296862365503193098>!');
        }

        msg.reply('Success! See `/help` for more information.');
        return await updateParticipantCount();
    });
};

export default async (msg, client, args) => {
    const tournamentInfo = await Tournament.find({ __v: 0 }, err => {
        if (err) {
            client.logger.error(err);
        }
    });

    if (!tournamentInfo[0].isOpen) {
        return msg.reply('Registration is closed.');
    }

    if (!args[0]) {
        return msg.reply('Use your TypeRacer **username** (NOT display name): Use `/register USERNAME`.');
    }

    // Check if the user already has an account
    const userExists = await User.findOne({ discordId: msg.author.id });

    if (userExists) {
        return msg.reply('You already have an account!');
    }

    // Check if someone is already registered with this NitroType link
    const linkExists: any = await User.findOne({ 
        nitroTypeLink: args[0].toLowerCase() 
    });
    if (linkExists) {
        return msg.reply('Someone is already registered with this account!');
    }

    const link: string = (args[0].includes('data.typeracer.com/pit/profile?user='))
        ? args[0]
        : `https://data.typeracer.com/pit/profile?user=${args[0]}`;

    const trLinkExists: boolean = await urlExists(link);
    return (trLinkExists)
        ? await registerUser(msg, link)
        : msg.reply('Invalid TypeRacer profile link!');
};
