var config = require('./config'),
	fork = require('child_process').fork,
	thinky = require('thinky')({
		host: config.app.rethink.host,
		port: config.app.rethink.port,
		db: config.app.rethink.db
	}),
	r = thinky.r,
	type = thinky.type,
	helpers = require('./helpers');

var args = process.argv.slice(2);

var UserModel = thinky.createModel('users', config.app.rethink.schema, config.app.rethink.pk);
var CacheModel = thinky.createModel('onlinecache',   {streams: type.object()});

var PaginateUsers = function(start, end, cb) {
	UserModel.filter({'intro_approved': true, 'intro_rejected': false}).count().execute().then(function(total) {
		UserModel.filter({'intro_approved': true, 'intro_rejected': false}).pluck('twitchname', 'redditname', 'intro_date', {'profile_data': 'intro_games'}).orderBy(r.desc('intro_date')).slice(start, end).run().then(function(dbres) {
			return cb(null, {'count': total, 'data': dbres});
		});
	});
}
var	dbSearch = function(string, cb) {
	UserModel.filter(function (doc) {
	    return doc("profile_data")("intro_games").match('(?i)'+string);
	}).filter({'intro_approved': true, 'intro_rejected': false}).pluck('twitchname', 'intro_date', {'profile_data': 'intro_games'}).orderBy(r.desc('intro_date')).run().then(function(users) {
		return cb(null, users);
	});
};

var adminGetIntroStatus = function(status, cb) {
	switch(status) {
		case 'approved':
			UserModel.filter({'intro_approved': true, 'intro_rejected': false}).pluck('twitchname', 'redditname', 'intro_date').run().then(function(dbres) {
				return cb(null, dbres);
			});
		break;
		case 'pending':
			UserModel.filter({'intro_approved': false, 'intro_rejected': false}).pluck('twitchname', 'redditname', 'intro_date', 'profile_data').run().then(function(dbres) {
				return cb(null, dbres);
			});
		break;
		case 'rejected':
			UserModel.filter({'intro_approved': false, 'intro_rejected': true}).pluck('twitchname', 'redditname', 'intro_date').run().then(function(dbres) {
				return cb(null, dbres);
			});
		break;
		default:
			UserModel.filter({'intro_approved': true, 'intro_rejected': false}).pluck('twitchname', 'redditname', 'intro_date').run().then(function(dbres) {
				return cb(null, dbres);
			});
	}
}
var getOnlineUsers = function(cb) {
	var child = fork('cache', [args[0]]);
		child.on('exit', function (data) {
		  CacheModel.without('id').run().then(function(streams) {
				UserModel.filter({'intro_approved': true, 'intro_rejected': false}).count().execute().then(function(total) {
					return cb(null, {online: streams, total: total});
				});
			});
		})
}

var selectUser = function(user, cb) {
	UserModel.get(user).run().then(function(dbres) {
		return cb(null, dbres)
	}).catch(thinky.Errors.DocumentNotFound, function(err) {
		console.error('Error:', err, err.stack);
		return cb(false);
	});
}

module.exports = {
	adminGetIntroStatus: adminGetIntroStatus,
	PaginateUsers: PaginateUsers,
	dbSearch: dbSearch,
	getOnlineUsers: getOnlineUsers,
	selectUser: selectUser
};
