const config = require('./config');
const thinky = require('thinky')({
    host: config.app.rethink.host,
    port: config.app.rethink.port,
    db: config.app.rethink.db,
});
const type = thinky.type;

module.exports = {
    primarykey: {
        users: 'twitchname',
    },
    users: {
        twitchname: type.string(),
        redditname: type.string(),
        intro_status: type.string(),
        intro_date:  type.string(),
        intro_data: type.object(),
        social_info: type.object(),
        feedback_data: type.array(),
        votes: type.array(),
        admin: type.boolean(),
        lastlogin: type.date(),
    },
    cache: {},
    feedback: {},
};
