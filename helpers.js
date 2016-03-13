var needle = require('needle'),
	express = require('express'),
	config = require('./config');
	batch = require('batchflow');
var middleware = {
	checkAdmin: (req, res, next) => {
	  return (req, res, next) => {
			if(req.session.isadmin) {
				next();
			} else {
				res.redirect('/logout');
			}
	  }
	},
	checkAuth: (req, res, next) => {
	  return (req, res, next) => {
	    if(!req.session.name) {
	  		res.render('message', {data: 'Please log in to access this page'});
	  	}else{
	  		next();
	  	}
	  }
	}
}
var twitch = {
	auth: (client_id, client_secret, grant_type, redirect_uri, code) => {
	  return new Promise((resolve, reject) => {
	    var request_object = {client_id: client_id,client_secret: client_secret,grant_type: grant_type, redirect_uri: redirect_uri, code: code };
	    needle.post('https://api.twitch.tv/kraken/oauth2/token', request_object, (err, resp, body) => {
	      if(!err) {
	        needle.get('https://api.twitch.tv/kraken/user?oauth_token=' + body.access_token, (err, data) => {
	          if(!err && data.statusCode == 200) {
							var modstatus = config.twitch.mods.indexOf(data.body.name) > -1;
	            resolve({'name': data.body.name, 'token': body.access_token, 'modstatus': modstatus});
	          } else {
	            reject(err);
	          }
	        });
	      } else {
	        reject(err);
	      }
	    });
	  });
	},
	profile: (username) => {
		return new Promise(function(resolve, reject) {
			needle.get("https://api.twitch.tv/kraken/channels/"+username, (err, data) => {
				if(err) {
					resolve(error);
				} else {
					if(data.body.status != "422") {
						resolve(data.body)
					} else {
						resolve(false);
					}
				}
			})
		});
	},
	boxart: (gameobject) => {
		new Promise(function(resolve, reject) {

			gamearray = [];
			for(var i in gameobject) {
				gamearray.push(gameobject[i].channel.game)
			}
			batch(gamearray).parallel().each(function(i, gametitle, cb) {
				needle.get("https://api.twitch.tv/kraken/search/games?q="+gametitle+"&type=suggest", (err, data) => {
					if(data && data.body && data.body.games && data.body.games[0]) {
						cb(data.body.games[0].box.large);
					}
				})
			}).end(function(final) {
				resolve(final);
			})
		});
	}
	// boxarthelper: (gametitle, cb) => {
	// 		needle.get("https://api.twitch.tv/kraken/search/games?q="+gametitle+"&type=suggest", (err, data) => {
	// 				cb(data.body);
	// 			// if(data.body.games[0]) {
	// 			// 	cb(data.body.games[0].box.large);
	// 			// } else {
	// 			// 	cb(false);
	// 			// }
	// 		});
	// },
	// boxart: (gameobject) => {
	// 	return new Promise(function(resolve, reject) {
	// 		gamearray = [];
	// 		for(var i in gameobject) {
	// 			gamearray.push(gameobject[i].channel.game)
	// 		}
	// 		async.each(gamearray, twitch.boxarthelper, function(results){
	// 			console.log(results);
	// 		})
	// 		// async.map(gamearray, twitch.boxarthelper, function(err, results){
	// 		// 	console.log(err);
	// 		// });
	// 	});
	// }
}
var general = {
	chunks: (array, size) => {
		var results = [];
		while(array.length) {
			results.push(array.splice(0, size));
		}
		return results;
	},
	transform: (item, cb) => {
		users = item.map((item) => {
			return item.twitchname;
		}).join(',')
		needle.get('https://api.twitch.tv/kraken/streams?channel='+users, (err, data) => {
			var online = []
			for(var i in data.body.streams) {
				online.push(data.body.streams[i]);
			}
			cb(null, online);
		});
	},
	random: (input) => {
		for(var n = 0; n < input.length - 1; n++) {
			var k = n + Math.floor(Math.random() * (input.length - n));
			var temp = input[k];
			input[k] = input[n];
			input[n] = temp;
		}
		return input;
	},
	inarray: (value, array) => {
		return array.indexOf(value) > -1;
	}
}

module.exports = {
	middleware: middleware,
	twitch: twitch,
	general: general
};
