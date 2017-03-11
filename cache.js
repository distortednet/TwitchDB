var cron = require('node-cron'),
config = require('./config'),
helpers = require('./helpers'),
db = require('./db'),
schema = require('./schema'),
thinky = require('thinky')({host:config.app.rethink.host, port:config.app.rethink.port, db: config.app.rethink.db}),
r = thinky.r,
type = thinky.type,
Query = thinky.Query;
CacheModel = thinky.createModel('onlinecache', schema.cache);

// var task = cron.schedule('*/5 * * * *', function() {
	CacheModel.delete().then(() => {
		console.log("executing task");
		return db.cache.approved();
	}).then((approvedusers) => {
		return mapusers = helpers.general.chunks(approvedusers, 100).map(function(user){
			csv = user.map((usr) => {
				return usr.twitchname;
			}).join(',');
			return csv;
		});
	}).then((userlist) => {
		userlist.forEach((userarr) => {
			helpers.twitch.getstreams(userarr).then((onlineusers) => {
				return CacheModel.save(onlineusers);
			})
		})
	}).then((done) => {
		console.log("task completed");
	})
// });

// task.start();
