module.exports = async client => {
    const {
        resetDailyStreak, users,
        refreshActivity, logger,
        msgCooldowns, guilds, user
    } = client
    
    refreshActivity()
    logger.ready(`${user.username} is ready: ${users.cache.size} users`)
}
