const baseUrl = `http://localhost:${config.app.port}`;
const twitchClientId = ' ';
const twitchClientSecret = ' ';
const twitchRedirectUri = `${baseUrl}/auth/`;

module.exports = {
    app: {
        port: 8080,
        baseurl: baseUrl,
        cookie: ' ',
        rethink: {
            host: '192.168.70.128',
            port: '28015',
            db: 'introdb',
        },
    },
    twitch: {
        grant: 'authorization_code',
        redirect: twitchRedirectUri,
        cid: twitchClientId,
        secret: twitchClientSecret,
        authurl: `https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=${twitchClientId}&redirect_uri=${twitchRedirectUri}&scope=user_read`,
        mods: [
            'distortednet',
        ],
    },
};
