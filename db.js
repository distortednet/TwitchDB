var config = require('./config'),
	thinky = require('thinky')({
		host: config.app.rethink.host,
		port: config.app.rethink.port,
		db: config.app.rethink.db
	}),
	r = thinky.r,
	type = thinky.type,
	helpers = require('./helpers');

var UserModel = thinky.createModel('users', config.app.rethink.schema, config.app.rethink.pk);

var adminGetIntroStatus = function(status, cb) {
	switch(status) {
		case 'approved':
			UserModel.filter({'intro_approved': true, 'intro_rejected': false}).run().then(function(dbres) {
				cb(dbres);
			});
		break;
		case 'pending':
			UserModel.filter({'intro_approved': false, 'intro_rejected': false}).run().then(function(dbres) {
				cb(dbres);
			});
		break;
		case 'rejected':
			UserModel.filter({'intro_approved': false, 'intro_rejected': true}).run().then(function(dbres) {
				cb(dbres);
			});
		break;
	}
}
var getOnlineUsers = function(cb) {
	UserModel.filter(r.row('intro_approved')).run().then(function(users) {
		var userarray = [];

		for(var i in users) {
			userarray.push(users[i].twitchname);
		}

		helpers.getLiveUsers(userarray, function(jsonlist) {
			if(jsonlist) {
				var streams = [];
				for(var i in jsonlist) {
					for(var x in jsonlist[i].streams) {
						streams.push(jsonlist[i].streams[x]);
					}
				}
				cb(streams);
			}
		});
	});
}

var selectUser = function(user, cb) {
	UserModel.get(user).run().then(function(dbres) {
		cb(dbres)
	}).catch(thinky.Errors.DocumentNotFound, function(err) {
		cb(false);
	});
}

module.exports = {
	adminGetIntroStatus: adminGetIntroStatus,
	getOnlineUsers: getOnlineUsers,
	selectUser: selectUser
};
