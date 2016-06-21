var cron = require('node-cron'),
config = require('./config'),
async = require('async'),
helpers = require('./helpers'),
db = require('./db'),
schema = require('./schema'),
thinky = require('thinky')({host:config.app.rethink.host, port:config.app.rethink.port, db: config.app.rethink.db}),
r = thinky.r,
type = thinky.type,
Query = thinky.Query;
CacheModel = thinky.createModel('onlinecache', schema.cache);


var task = cron.schedule('*/5 * * * *', function() {
console.log("running scheduled task");
db.cache.approved().then((db) => {
	CacheModel.delete().then(function(result) {
		var chunked = helpers.general.chunks(db, 100);
		async.map(chunked, helpers.general.transform, (err, result) => {
			result.forEach((streams) => {
				streams.forEach((users) => {
					CacheModel.save(users).then(function(res) {}).error(function(err) {
						console.log(err);
					});
				})
			})
		})
	})
});
}, false);

task.start();
