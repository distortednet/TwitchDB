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
	},
	checkxhr: (req, res, next) => {
	  return (req, res, next) => {
	    if(!req.xhr) {
	  		res.send('this is an improper request');
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
	}
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
			for(var i in data.body.streams) { // data.body occasionally errors, possibly when a connection to the twitch api fails
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
