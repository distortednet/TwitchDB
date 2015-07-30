var	batch = require('batchflow'),
		http = require('https'),
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
function requrl(url, cb) {
	http.get(url, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			cb(JSON.parse(body));
		});
	}).on('error', function(e) {
		console.log(e);
	});
}
var getLiveUsers = function(array, cb) {
	var userlist = [],
		chunked = chunks(array, 100);

	for(var i = 0; i < chunked.length; i++) {
		userlist.push('https://api.twitch.tv/kraken/streams?channel=' + chunked[i].join(','));
	}

	batch(userlist).sequential().each(function(i, url, done) {
		requrl(url, function(res) {
			done(res);
		});
	}).end(function(final) {
		cb(final);
	});

};

module.exports = {
	getLiveUsers: getLiveUsers,
	shuffleArray: shuffleArray,
	inArray: inArray,
	isMod: isMod,
	checkAuth: checkAuth
};
