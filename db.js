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

var AdminGetIntroStatus = function(status, cb) {
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

var GetOnlineUsers = function(cb) {
	UserModel.filter(r.row('intro_approved')).run().then(function(users) {
		var userarray = [];

		for(var i in users) {
			userarray.push(users[i].twitchname);
		}

		helpers.getliveusers(userarray, function(jsonlist) {
			if(jsonlist) {
				var jsonurl = config.app.baseurl + 'api/streams/json';

				oboe(jsonurl).node('streams.*', function(streams) {
					return {
						'game': streams.game,
						'viewers': streams.viewers,
						'preview': streams.preview.large,
						'video_height': streams.video_height,
						'channel': {
							'logo': streams.channel.logo,
							'mature': streams.channel.mature,
							'status': streams.channel.status,
							'url': streams.channel.url,
							'name': streams.channel.name,
							'followers': streams.channel.followers,
							'views': streams.channel.views,
						}
					};
				}).on('node', '*._links', function() {
					return oboe.drop;
				}).done(function(things) {
					var streams = [];

					for(var i in things) {
						for(var x in things[i].streams) {
							streams.push(things[i].streams[x]);
						}
					}

					cb(streams);
					things = null;
					streams = null;
				});
			}
		});
	});
}

var SelectUser = function(user, cb) {
	UserModel.get(user).run().then(function(dbres) {
		cb(dbres)
	}).catch(thinky.Errors.DocumentNotFound, function(err) {
		cb(false);
	});
}

module.exports = {
	AdminGetIntroStatus: AdminGetIntroStatus,
	GetOnlineUsers: GetOnlineUsers,
	SelectUser: SelectUser
};
