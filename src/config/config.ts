const colors: any = {
    red: 0xE84444,
    yellow: 0xF09F19,
    green: 0x40AC7B
};

const version = '0.0.0';
const prefix = '/';
const devMode = false;
const logEnabled = false;
const uriParams: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    keepAlive: true
};
const cooldowns: any = {
    leaderboard: 5 * 60 * 1000,
    activity: 5 * 60 * 1000
};

export {
    colors, version, prefix, 
    devMode, logEnabled, uriParams, cooldowns
};
