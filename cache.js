const cron = require('node-cron');
const config = require('./config');
const helpers = require('./helpers');
const db = require('./db');
const schema = require('./schema');
const thinky = require('thinky')({
    host: config.app.rethink.host,
    port: config.app.rethink.port,
    db: config.app.rethink.db,
});
const r = thinky.r;
const type = thinky.type;
const Query = thinky.Query;
const CacheModel = thinky.createModel('onlinecache', schema.cache);

const task = cron.schedule('*/5 * * * *', function() {
	CacheModel.delete().then(() => {
		console.log('executing task');

		return db.cache.approved();
	}).then((approvedUsers) => {
		return mapusers = helpers.general.chunks(approvedUsers, 100).map(user => {
			csv = user.map(usr => usr.twitchname).join(',');

			return csv;
		});
	}).then(userlist => {
		userlist.forEach(userArray => {
			helpers.twitch.getstreams(userArray).then(onlineUsers => CacheModel.save(onlineUsers));
		});
	}).then(done => {
		console.log('task completed');
	});
});

task.start();
