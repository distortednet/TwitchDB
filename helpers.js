var	batch = require('batchflow'),
		http = require('https'),
		needle = require('needle'),
		config = require('./config');

var chunks = function(array, size) {
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
// function requrl(url, cb) {
// 	http.get(url, function(res) {
// 		var body = '';
// 		res.on('data', function(chunk) {
// 			body += chunk;
// 		});
// 		res.on('end', function() {
// 			return cb(null, JSON.parse(body));
// 		});
// 	}).on('error', function(e) {
// 		console.error('Error:', err, err.stack);
// 		return cb(err);
// 	});
// }
// var getLiveUsers = function(arr, cb) {
// 	var userlist = [],
// 	 	chunked = chunks(arr, 100);
//
// 	for(var i = 0; i < chunked.length; i++) {
// 		userlist.push('https://api.twitch.tv/kraken/streams?channel=' + chunked[i].join(','));
// 	}
//
// 	batch(userlist).sequential().each(function(i, url, done) {
// 		needle.get(url, function(err, res) {
// 			if (err) { console.error('Error:', err, err.stack); }
// 			done(res.body);
// 		});
// 	}).end(function(final) {
// 		return cb(null, final);
// 	});
//
// };
var generatePages = function(page, cb) {
	var currentpage = parseInt(page);
	if(currentpage != 0) {
		 cb({previous: currentpage - 25, next: currentpage + 25});
	} else {
		return cb(null, {previous: 0, next: currentpage + 25});
	}
}

module.exports = {
	shuffleArray: shuffleArray,
	generatePages: generatePages,
	inArray: inArray,
	isMod: isMod,
	checkAuth: checkAuth,
	chunks: chunks
};
