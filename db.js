var config = require('./config'),
	thinky = require('thinky')({
		host: config.app.rethink.host,
		port: config.app.rethink.port,
		db: config.app.rethink.db
	}),
	r = thinky.r,
	type = thinky.type,
	helpers = require('./helpers'),
	oboe = require('oboe');

var UserModel = thinky.createModel('users', config.app.rethink.schema, config.app.rethink.pk);

var adminGetIntroStatus = function(status, cb) {
	UserModel.run().then(function(dbres) {
		var statusarray = [];

		switch(status) {
			case 'pending':
				for(var i in dbres) {
					if(dbres[i].intro_approved == false && dbres[i].intro_rejected == false) {
						statusarray.push(dbres[i]);
					}
				}

				cb(statusarray);
				break;
			case 'approved':
				for(var i in dbres) {
					if(dbres[i].intro_approved == true && dbres[i].intro_rejected == false) {
						statusarray.push(dbres[i]);
					}
				}

				cb(statusarray);
				break;
			case 'rejected':
				for(var i in dbres) {
					if(dbres[i].intro_approved == false && dbres[i].intro_rejected == true) {
						statusarray.push(dbres[i]);
					}
				}

				cb(statusarray);
				break;
			default:
				cb('no status selected');
				break;
		}
	});
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
