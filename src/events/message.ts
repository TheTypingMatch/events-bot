import { User } from '../models/user.model';
import { run } from '../commands';

module.exports = async (client: any, msg: any) => {
    const { content, author } = msg;
    const { logger, msgCooldowns, config } = client;
    const userId: string = author.id;
    
    if (author.bot) return;

    // Handle command arguments
    const args: string[] = content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd: string = args.shift().toLowerCase();
    const generalCmds: string[] = ['help', 'register', 'ping', 'stats', 'info', 'logs'];
    const hasAdminPerms = msg.member.roles.cache.some(r => {
        return (r.name === "Event Manager" || r.name === "Event Officiator");
    })


    // Check if the user has an account.
    const user = await User.findOne({ discordId: userId });
    if (user) {
        if (user.name !== author.username) {
            const updatedName: { name: string } = { name: author.username };

            User.updateOne({ discordId: userId }, updatedName, err => {
                if (err) {
                    return logger.error(err);
                }

                return logger.log(`Updated username ${user.name} to ${author.username}`, 'ready');
            });
        }
    }

    if (!content.startsWith(config.prefix)) return;
    if (hasAdminPerms) {
        return run(cmd, msg, client, args);
    }
    if (!user && !generalCmds.includes(cmd)) {
        return msg.reply('You must `/register` an account before using any other commands!');
    }

    // Command handler
    run(cmd, msg, client, args);
};
