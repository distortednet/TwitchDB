var needle = require('needle'),
	config = require('./config'),
	helpers = require('./helpers'),
  schema = require('./schema'),
	async = require('async'),
  thinky = require('thinky')({host:config.app.rethink.host, port:config.app.rethink.port, db: config.app.rethink.db}),
	r = thinky.r,
	type = thinky.type,
	Query = thinky.Query;
  UserModel = thinky.createModel('users', schema.users, schema.primarykey.users);
	CacheModel = thinky.createModel('onlinecache', schema.cache);

var intro = {
  filter: (status) => {
    return new Promise((resolve, reject) => {
			if(status != "pending") {
				UserModel.filter({'intro_status': status}).orderBy('intro_date').limit(50).run().then((db) => {
	        resolve(db);
	      }).catch(function(err) {
					console.log("query error:" + err);
				})
			} else {
				UserModel.filter({'intro_status': status}).orderBy('intro_date').run().then((db) => {
	        resolve(db);
	      }).catch(function(err) {
					console.log("query error:" + err);
				})
			}

    });
  },
	sessions: () => {
		return new Promise(function(resolve, reject) {
			r.db(config.app.rethink.db).table('sessions')('session').run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log('query error:' + err);
			})
		});
	},
	setstatus: (username, status) => {
		return new Promise((resolve, reject) => {
			UserModel.filter({'twitchname': username}).update({"intro_status": status}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	update: (object) => {
		return new Promise((resolve, reject) => {
			UserModel.filter({'twitchname': object.twitchname}).update(object).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	selectadmins:() => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'admin': true}).run().then((db) => {
				resolve(db);
			})
		});
	},
	select: (username) => {
		return new Promise((resolve, reject) => {
      UserModel.filter({'twitchname': username}).run().then((db) => {
        resolve(db);
      }).catch(function(err) {
				console.log("query error:" + err);
			})
    });
	},
	create: (username) => {
		return new Promise((resolve, reject) => {
			UserModel.get(username).run().then((db) => {
				var logindate = new Date();
				console.log(logindate);
				UserModel.filter({'twitchname': username}).update({"lastlogin": logindate}).run().then((dbres) => {
					resolve("profile_exists");
				});
			}).catch(thinky.Errors.DocumentNotFound, (err) => {
				var logindate = new Date();
				var UserData = new UserModel({twitchname: username, lastlogin: logindate});
				UserData.save((err) => {
					if(err) { reject(err) };
					resolve("profile_created");
				});
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	search: (username, game, orderby) => {
		return new Promise((resolve, reject) => {
			UserModel.filter(r.row("twitchname").eq(username).or(r.row("redditname").eq(username)).or(r.row("intro_data")("intro_games").match("(?i)"+game))).orderBy(orderby).run().then((db) => {
				if(db.length) {
					resolve(db)
				} else {
					resolve(false)
				}
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	mostrecent: (start, end) => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'intro_status': 'approved'}).orderBy('intro_date').slice(start,end).run().then((streams) => {
				resolve(streams);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	mostvotes: () => {
		return new Promise(function(resolve, reject) {
			CacheModel.eqJoin(r.row('channel')('name'), r.db(config.app.rethink.db).table('users')).filter(r.row('right')('votes')).orderBy(r.desc(r.row('right')('votes').count())).without('right').zip().run().then((streams) => {
				resolve(streams);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	randomintro: () => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).sample(1).run().then((db) => {
				 resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
}
var feedback = {
	send: (username, object) => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'twitchname': username}).update({'feedback_data': r.row("feedback_data").default([]).append(object)}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	generateuuid:(username, timestamp) => {
		return new Promise(function(resolve, reject) {
			r.uuid(username + " " + timestamp).then((result) => {
				resolve(result);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	setreadstatus:(username, uuid, readstatus) => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'twitchname': username}).update({'feedback_data': r.row('feedback_data').map(function (msg) {return r.branch(msg('uuid').eq(uuid),msg.merge({read: readstatus}),msg)})}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	setfeedbackstatus:(username, uuid, feedbackstatus) => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'twitchname': username}).update({'feedback_data': r.row('feedback_data').map(function (msg) {return r.branch(msg('uuid').eq(uuid),msg.merge({status: feedbackstatus}),msg)})}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	update:(fromuser, touser, object) => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'twitchname': touser}).update({'feedback_data': r.row('feedback_data').map(function (msg) {return r.branch(msg('fromuser').eq(fromuser),msg.merge(object),msg)})}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	filterstatus:(status) => {
		return new Promise(function(resolve, reject) {
			r.db(config.app.rethink.db).table('users')('feedback_data').concatMap(function(doc) {return doc.filter({'status': status})}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	find:(fromuser, touser) => {
		return new Promise(function(resolve, reject) {
			r.db(config.app.rethink.db).table('users')('feedback_data').concatMap(function(doc) {return doc.filter({'fromuser': fromuser, 'touser': touser})}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	}
}
var cache = {
	approved: () => {
    return new Promise((resolve, reject) => {
      UserModel.filter({'intro_status': "approved"}).orderBy('intro_date').pluck('twitchname').run().then((db) => {
        resolve(db);
      }).catch(function(err) {
				console.log("query error:" + err);
			})
    });
  },
	online: (start, end) => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).orderBy(r.desc('viewers')).slice(start, end).run().then((streams) => {
				resolve(streams);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	random:(limit) => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).sample(limit).run().then((streams) => {
				resolve(streams);
			});
		});
	},
	maturefilter: (start, end, mature) => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).filter({'channel': {'mature': mature}}).orderBy(r.desc('viewers')).slice(start, end).run().then((streams) => {
				resolve(streams);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	gamelist: () => {
		return new Promise(function(resolve, reject) {
			CacheModel.group(r.row('channel')('game')).pluck({channel: ['game']}).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	},
	gamesearch: (game) => {
		return new Promise(function(resolve, reject) {
			CacheModel.filter(r.row("channel")("game").match("(?i)"+game)).run().then((db) => {
				resolve(db);
			}).catch(function(err) {
				console.log("query error:" + err);
			})
		});
	}

}

module.exports = {
  intro: intro,
	feedback: feedback,
	cache: cache
};
