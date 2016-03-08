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
      UserModel.filter({'intro_status': status}).orderBy('intro_date').run().then((db) => {
        resolve(db);
      });
    });
  },
	setstatus: (username, status) => {
		return new Promise((resolve, reject) => {
			UserModel.filter({'twitchname': username}).update({"intro_status": status}).run().then((db) => {
				resolve(db);
			});
		});
	},
	update: (object) => {
		return new Promise((resolve, reject) => {
			UserModel.filter({'twitchname': object.twitchname}).update(object).run().then((db) => {
				resolve(db);
			});
		});
	},
	select: (username) => {
		return new Promise((resolve, reject) => {
      UserModel.filter({'twitchname': username}).run().then((db) => {
        resolve(db);
      });
    });
	},
	create: (username) => {
		return new Promise((resolve, reject) => {
			UserModel.get(username).run().then((db) => {
					resolve("profile_exists");
			}).catch(thinky.Errors.DocumentNotFound, (err) => {
				var UserData = new UserModel({twitchname: username});
				UserData.save((err) => {
					if(err) { reject(err) };
					resolve("profile_created");
				});
			});
		});
	},
	search: (username, game, orderby) => {
		return new Promise((resolve, reject) => {
			UserModel.filter(r.row("twitchname").eq(username).or(r.row("redditname").eq(username)).or(r.row("profile_data")("intro_games").match("(?i)"+game))).orderBy(orderby).run().then((db) => {
				if(db.length) {
					resolve(db)
				} else {
					resolve(false)
				}
			});
		});
	},
	mostrecent: (start, end) => {
		return new Promise(function(resolve, reject) {
			UserModel.filter({'intro_status': 'approved'}).orderBy('intro_date').slice(start,end).run().then((streams) => {
				resolve(streams);
			});
		});
	},
	randomintro: () => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).sample(1).run().then((db) => {
				 resolve(db);
			})
		});
	},
}
var cache = {
	approved: () => {
    return new Promise((resolve, reject) => {
      UserModel.filter({'intro_status': "approved"}).orderBy('intro_date').pluck('twitchname').run().then((db) => {
        resolve(db);
      });
    });
  },
	online: (start, end) => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).orderBy(r.desc('viewers')).slice(start, end).run().then((streams) => {
				resolve(streams);
			});
		});
	},
	maturefilter: (start, end, mature) => {
		return new Promise(function(resolve, reject) {
			CacheModel.without('id', '_links', {'channel' : '_links'}).filter({'channel': {'mature': mature}}).orderBy(r.desc('viewers')).slice(start, end).run().then((streams) => {
				resolve(streams);
			});
		});
	},
	games: () => {
		return new Promise(function(resolve, reject) {
			CacheModel.filter(r.row('channel')('game')).pluck({channel: ['game']}).orderBy(r.row('channel')('game')).distinct().run().then((db) => {
				resolve(db);
			});
		});
	},
	search: (game) => {
		return new Promise(function(resolve, reject) {
			CacheModel.filter(r.row("channel")("game").match("(?i)"+game)).run().then((db) => {
				resolve(db);
			});
			// var gamearray = [];
			// for(var i in game) { gamearray.push(game[i].channel.game); }
			// CacheModel.filter(function(user) {return r.expr(gamearray).contains(user('channel')('game')) }).run().then((db) => {
			// 	resolve(db);
			// })
		});
	}

}

module.exports = {
  intro: intro,
	cache: cache
};
