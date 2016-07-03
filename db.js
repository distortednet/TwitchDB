const needle = require('needle');
const config = require('./config');
const helpers = require('./helpers');
const schema = require('./schema');
const async = require('async');
const thinky = require('thinky')({
    host: config.app.rethink.host,
    port: config.app.rethink.port,
    db: config.app.rethink.db,
});
const r = thinky.r;
const type = thinky.type;
const Query = thinky.Query;
const UserModel = thinky.createModel('users', schema.users, schema.primarykey.users);
const CacheModel = thinky.createModel('onlinecache', schema.cache);

const queryErr = err => {
    console.log(`Query Error: ${err}`);
};

const const = {
    filter(status) {
        return new Promise((resolve, reject) => {
            let model = UserModel.filter({
                'intro_status': status,
            }).orderBy('intro_date');

            if (status !== 'pending') {
                model = model.limit(50);
            }

            model.run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    sessions() {
        return new Promise((resolve, reject) => {
            r.db(config.app.rethink.db).table('sessions')('session').run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    setstatus(username, status) => {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': username,
            }).update({
                'intro_status': status,
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    update(object) {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': object.twitchname,
            }).update(object).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    selectadmins() {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'admin': true,
            }).run().then(db => {
                resolve(db);
            });
        });
    },
    select(username) {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': username,
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    create(username) {
        return new Promise((resolve, reject) => {
            UserModel.get(username).run().then(db => {
                const logindate = new Date();

                console.log(logindate);

                UserModel.filter({
                    'twitchname': username,
                }).update({
                    'lastlogin': logindate,
                }).run().then(dbres => {
                    resolve('profile_exists');
                });
            }).catch(thinky.Errors.DocumentNotFound, err => {
                const logindate = new Date();
                const UserData = new UserModel({
                    twitchname: username,
                    lastlogin: logindate,
                });

                UserData.save(err => {
                    if (err) {
                        reject(err);
                    }

                    resolve('profile_created');
                });
            }).catch(err => queryErr(err));
        });
    },
    search(username, game, orderby) {
        return new Promise((resolve, reject) => {
            UserModel.filter(
                r.row('twitchname').eq(username)
                    .or(r.row('redditname').eq(username))
                    .or(r.row('intro_data')('intro_games').match("(?i)" + game))
            ).orderBy(orderby).run().then(db => {
                if (db.length) {
                    resolve(db);
                }

                resolve(false);
            }).catch(err => queryErr(err));
        });
    },
    mostrecent(start, end) {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'intro_status': 'approved',
            }).orderBy('intro_date').slice(start, end).run().then(streams => {
                resolve(streams);
            }).catch(err => queryErr(err));
        });
    },
    mostvotes() {
        return new Promise((resolve, reject) => {
            CacheModel.eqJoin(r.row('channel')('name'), r.db(config.app.rethink.db).table('users'))
                .filter(r.row('right')('votes'))
                .orderBy(r.desc(r.row('right')('votes').count()))
                .without('right').zip().run().then(streams => {
                    resolve(streams);
                }).catch(err => queryErr(err));
        });
    },
    randomintro() {
        return new Promise((resolve, reject) => {
            CacheModel.without('id', '_links', {
                'channel': '_links',
            }).sample(1).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
};
const feedback = {
    send(username, object) => {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': username,
            }).update({
                'feedback_data': r.row('feedback_data').default([]).append(object),
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    generateuuid(username, timestamp) {
        return new Promise((resolve, reject) => {
            r.uuid(`${username} ${timestamp}`).then(result => {
                resolve(result);
            }).catch(err => queryErr(err));
        });
    },
    setreadstatus(username, uuid, readstatus) {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': username,
            }).update({
                'feedback_data': r.row('feedback_data').map(msg => {
                    return r.branch(msg('uuid').eq(uuid), msg.merge({
                        read: readstatus,
                    }), msg);
                }),
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    setfeedbackstatus(username, uuid, feedbackstatus) {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': username,
            }).update({
                'feedback_data': r.row('feedback_data').map(msg => {
                    return r.branch(msg('uuid').eq(uuid), msg.merge({
                        status: feedbackstatus,
                    }), msg);
                }),
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    update(fromuser, touser, object) {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'twitchname': touser,
            }).update({
                'feedback_data': r.row('feedback_data').map(msg => {
                    return r.branch(msg('fromuser').eq(fromuser), msg.merge(object), msg);
                }),
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    filterstatus(status) {
        return new Promise((resolve, reject) => {
            r.db(config.app.rethink.db).table('users')('feedback_data').concatMap(doc => {
                return doc.filter({
                    'status': status,
                });
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    find(fromuser, touser) {
        return new Promise((resolve, reject) => {
            r.db(config.app.rethink.db).table('users')('feedback_data').concatMap(doc => {
                return doc.filter({
                    'fromuser': fromuser,
                    'touser': touser,
                });
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
};
const cache = {
    approved() {
        return new Promise((resolve, reject) => {
            UserModel.filter({
                'intro_status': 'approved',
            }).orderBy('intro_date').pluck('twitchname').run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    online(start, end) {
        return new Promise((resolve, reject) => {
            CacheModel.without('id', '_links', {
                'channel': '_links',
            }).orderBy(r.desc('viewers')).slice(start, end).run().then(streams => {
                resolve(streams);
            }).catch(err => queryErr(err));
        });
    },
    random(limit) {
        return new Promise((resolve, reject) => {
            CacheModel.without('id', '_links', {
                'channel' : '_links',
            }).sample(limit).run().then(streams => {
                resolve(streams);
            });
        });
    },
    maturefilter(start, end, mature) {
        return new Promise((resolve, reject) => {
            CacheModel.without('id', '_links', {
                'channel' : '_links',
            }).filter({
                'channel': {
                    'mature': mature,
                },
            }).orderBy(r.desc('viewers')).slice(start, end).run().then(streams => {
                resolve(streams);
            }).catch(err => queryErr(err));
        });
    },
    gamelist() {
        return new Promise((resolve, reject) => {
            CacheModel.group(r.row('channel')('game')).pluck({
                channel: ['game'],
            }).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
    gamesearch(game) {
        return new Promise((resolve, reject) => {
            CacheModel.filter(r.row('channel')('game').match("(?i)" + game)).run().then(db => {
                resolve(db);
            }).catch(err => queryErr(err));
        });
    },
};

module.exports = {
    intro: intro,
    feedback: feedback,
    cache: cache,
};
