const fetch = require('node-fetch');
import { User } from '../models/user.model';
import { Tournament } from '../models/tournament.model';

const urlExists = async (msg, url: string) => {
    return await fetch(url)
        .then((res: { text: () => any }) => res.text())
        .then((res: string | string[]) => res.includes('(TypeRacer Profile)'))
        .catch(() => msg.reply('An error occurred.'));
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

            return nums[2];
        }).catch(err => 0);
};

const registerUser = async (client, msg, trLink: string) => {
    const defaultWpm = await fetchAverage(trLink);

    if (defaultWpm === 0 || defaultWpm === 2020) {
        return msg.reply('This account does not have a WPM average! It is recommended that you race at least 10 times before competing.');
    }

    const user = new User({
        date: new Date(),
        name: msg.author.username,
        typeRacerLink: trLink,
        discordId: msg.author.id,
        avgWpm: defaultWpm
    });

    user.save(async (err: any) => {
        if (err) {
            client.logger.error(err);
            return msg.reply('An error occurred. Contact <@296862365503193098>!');
        }

        client.logger.ready(`${msg.author.username} (${msg.author.id}) has been registered to ${trLink} succesfully.`);
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
    
    const link: string = (args[0].includes('data.typeracer.com/pit/profile?user='))
        ? args[0].toLowerCase()
        : `https://data.typeracer.com/pit/profile?user=${args[0]}`.toLowerCase();

    // Check if someone is already registered with this TypeRacer link
    const linkExists: any = await User.findOne({ 
        typeRacerLink: link
    });

    if (linkExists) {
        return msg.reply('Someone is already registered with this account!');
    }

    const trLinkExists: boolean = await urlExists(msg, link);
    return (trLinkExists)
        ? await registerUser(client, msg, link)
        : msg.reply('Invalid TypeRacer profile link!');
};
