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
var generatePages = function(page, max, cb) {
	var currentpage = parseInt(page);
	if(currentpage != 0) {
		 cb(null, {previous: currentpage - max, next: currentpage + max});
	} else {
		return cb(null, {previous: 0, next: currentpage + max});
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
