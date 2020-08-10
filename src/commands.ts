import fs = require('fs')
import path = require('path')
import { User } from './models/user.model';
import { MessageEmbed } from 'discord.js';

const run = async (cmd: string, msg, client, args: string[]) => {
    const userId: { discordId: string } = { discordId: msg.author.id };
    const user: any = await User.findOne({ discordId: msg.author.id });

    const generalPath: string = path.resolve(`./build/commands/${cmd}.js`);
    const adminPath: string = path.resolve(`./build/commands/admin/${cmd}.js`);
    const hasAdminPerms: boolean = (fs.existsSync(adminPath) && msg.author.id === '296862365503193098');

    if (hasAdminPerms) {
        const adminCMD = await import(`./commands/admin/${cmd}`);
        
        msg.channel.startTyping();
        adminCMD.default(msg, client, args);
    }

    else if (fs.existsSync(generalPath)) {
        const generalCMD = await import(`./commands/${cmd}`);

        msg.channel.startTyping();
        generalCMD.default(msg, client, args);
    }

    return msg.channel.stopTyping();
};

export { run };
