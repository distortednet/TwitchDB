const needle = require('needle');
const express = require('express');
const config = require('./config');
const db = require('./db');

const middleware = {
    checkAdmin(req, res, next) {
        return (req, res, next) => {
            if (req.session.isadmin) {
                next();
            }

            res.redirect('/logout');
        };
    },
    checkAuth(req, res, next) {
        return (req, res, next) => {
            if (!req.session.name) {
                res.redirect(config.twitch.authurl);
            }

            next();
        };
    },
    checkxhr(req, res, next) {
        return (req, res, next) => {
            if (!req.xhr) {
                res.send('this is an improper request');
            }

            next();
        };
    },
};

const twitch = {
    auth(client_id, client_secret, grant_type, redirect_uri, code) {
        return new Promise((resolve, reject) => {
            const requestObject = {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: grant_type,
                redirect_uri: redirect_uri,
                code: code,
            };

            needle.post('https://api.twitch.tv/kraken/oauth2/token', requestObject, config.twitch.header, (err, resp, body) => {
                if (!err) {
                    needle.get(`https://api.twitch.tv/kraken/user?oauth_token=${body.access_token}`, config.twitch.header, (err, data) => {
                        if (!err && data.statusCode == 200) {
                            db.intro.select(data.body.name).then(db => {
                                resolve({
                                    'name': data.body.name,
                                    'token': body.access_token,
                                    'modstatus': db.length && db[0].admin,
                                });
                            });
                        } else {
                            reject(err);
                        }
                    });
                } else {
                    reject(err);
                }
            });
        });
    },
    profile(username) {
        return new Promise((resolve, reject) => {
            needle.get(`https://api.twitch.tv/kraken/channels/${username}`, config.twitch.header, (err, data) => {
                if (err) {
                    resolve(err);
                } else if (data.body.status != '422') {
                    resolve(data.body);
                }

                resolve(false);
            });
        });
    },
    videos(username, limit, type) {
        return new Promise((resolve, reject) => {
            needle.get(`https://api.twitch.tv/kraken/channels/${username}/videos?limit=${limit}&broadcasts=${type}`, config.twitch.header, (err, data) => {
                if (err) {
                    resolve(err);
                } else if (data.body.status != '422') {
                    resolve(data.body.videos);
                }

                resolve(false);
            });
        });
    },
    getstreams(listarr) {
        return new Promise((resolve, reject) => {
            needle.get(`https://api.twitch.tv/kraken/streams?channel=${listarr}`, config.twitch.header, (err, data) => {
                resolve(data.body.streams);
            });
        });
    },
};

const general = {
    chunks(array, size) {
        let results = [];

        while (array.length) {
            results.push(array.splice(0, size));
        }

        return results;
    },
    random(input) {
        for(let n = 0; n < input.length - 1; n++) {
            const k = n + Math.floor(Math.random() * (input.length - n));
            const temp = input[k];

            input[k] = input[n];
            input[n] = temp;
        }

        return input;
    },
    inarray(value, array) {
        return array.indexOf(value) !== -1;
    },
    setredditflair(redditname, twitchname, auth, oauth) {
        return new Promise((resolve, reject) => {
            needle.post(`https://${oauth.clientid}:${oauth.secret}@www.reddit.com/api/v1/access_token`, auth, (err, res) => {
                const options = {
                    headers: {
                        'Authorization': `bearer ${res.body.access_token}`,
                        'User-Agent': `twitchdb/0.1 by ${auth.username}`,
                    },
                };

                needle.get(`https://oauth.reddit.com/r/twitch/api/flairlist.json?name=${redditname}`, options, (err, oauth) => {
                    if (oauth.body.users[0].user.toLowerCase() == redditname.toLowerCase()) {
                        if (
                            oauth.body.users[0].flair_text === null ||
                            !oauth.body.users[0].flair_text.length
                        ) {
                            const flairdata = {
                                'api_type': 'json',
                                'css_class': 'introflair',
                                'name': redditname,
                                'text': `http://www.twitch.tv/${twitchname}`
                            };

                            needle.post('https://oauth.reddit.com/r/twitch/api/flair', flairdata, options, (err, flair) => {
                                if (flair.body.json.errors.length == 0) {
                                    resolve({
                                        'status': true,
                                    });
                                } else {
                                    resolve({
                                        'status': false,
                                    });
                                }
                            });
                        } else {
                            resolve({
                                'status': true,
                            });
                        }
                    } else {
                        resolve({
                            'status': false,
                        });
                    }
                });
            });
        });
    },
};

module.exports = {
    middleware: middleware,
    twitch: twitch,
    general: general
};
