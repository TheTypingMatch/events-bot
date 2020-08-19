import { User } from '../models/user.model';
import { Loser } from '../models/losers.model';
import { Tournament } from '../models/tournament.model';

const getTopTen = (arr: any[]) => arr.slice(-10).reverse();

// The sort type is the property of users that the function sorts by
const sortUsers = (users: any[], sortType: string) => {
    return users.sort((a, b) => {
        return (a[sortType] > b[sortType]) ? 1 : (
            (b[sortType] > a[sortType]) ? -1 : 0
        );
    });
};

const functions = (client: any) => {
    const { cooldowns } = client.config;

    setInterval(client.refreshActivity = () => {
        client.user.setPresence({ 
            activity: {
                type: 'WATCHING', 
                name: `${client.users.cache.size} users`
            }, 
            status: 'online'
        });
        client.logger.ready('Done updating presence.');
    }, cooldowns.activity);
    
    setInterval(client.refreshLeaderboard = async () => {
        const users = await User.find({ __v: 0 }, err => {
            if (err) {
                client.logger.err(err);
            }
        });

        const losers = await Loser.find({ __v: 0 }, err => {
            if (err) {
                client.logger.err(err);
            }
        });

        const topTen = getTopTen(sortUsers([...users, ...losers], 'avgWpm'));

        Tournament.updateOne({ isOpen: true }, {
            leaderboard: topTen
        }, err => {
            if (err) {
                client.logger.error(err);
            }
        });

        return client.logger.ready('Done updating leaderboard.');
    }, cooldowns.leaderboard);
};

export { functions };
