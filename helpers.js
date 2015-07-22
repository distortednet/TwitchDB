var jsonraver = require('jsonraver'),
	jsonfile = require('jsonfile'),
	config = require('./config');

function chunks(array, size) {
	var results = [];

	while(array.length) {
		results.push(array.splice(0, size));
	}

	return results;
}

var inArray = function(value, array) {
	return array.indexOf(value) > -1;
};

var shuffleArray = function(sourceArray) {
	for(var n = 0; n < sourceArray.length - 1; n++) {
		var k = n + Math.floor(Math.random() * (sourceArray.length - n));
		var temp = sourceArray[k];
		sourceArray[k] = sourceArray[n];
		sourceArray[n] = temp;
	}
};

var isMod = function(username) {
	return config.twitch.mods.indexOf(username) > -1;
};

var checkAuth = function(req, res, next) {
	if(!req.session.name) {
		res.render('message', {data: 'Please log in to access this page'});
	}else{
		next();
	}
};

var getLiveUsers = function(array, cb) {
	var userlist = [],
		chunked = chunks(array, 100);

	for(var i = 0; i < chunked.length; i++) {
		userlist.push('https://api.twitch.tv/kraken/streams?channel=' + chunked[i].join(','));
	}

	jsonraver(userlist, function(err, data) {
		if(!err) {
			jsonfile.writeFile('data.json', data, function(err) {
				userlist = null;
				chunked = null;

				cb(!err);
			});
		}else{
			cb(false);
		}
	});
};

var getRedditName = function(id, cb) {
	needle.get('https://www.reddit.com/r/Twitch/comments/' + id + '.json', function(error, response) {
		if(!error && response.statusCode == 200) {
			cb(response.body[0].data.children[0].data.author);
		}else{
			cb(false);
		}
	});
};

module.exports = {
	getLiveUsers: getLiveUsers,
	shuffleArray: shuffleArray,
	getRedditName: getRedditName,
	inArray: inArray,
	isMod: isMod,
	checkAuth: checkAuth
};
