var jsonraver = require('jsonraver'),
	jsonfile = require('jsonfile');

function chunks(array, size) {
	var results = [];

	while(array.length) {
		results.push(array.splice(0, size));
	}

	return results;
}

var inarray = function(value, array) {
	return array.indexOf(value) > -1;
}

var shuffle = function(sourceArray) {
	for(var n = 0; n < sourceArray.length - 1; n++) {
		var k = n + Math.floor(Math.random() * (sourceArray.length - n));
		var temp = sourceArray[k];
		sourceArray[k] = sourceArray[n];
		sourceArray[n] = temp;
	}
}

var getliveusers = function(array, cb) {
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
}

var getredditname = function(id, cb) {
	needle.get('https://www.reddit.com/r/Twitch/comments/' + id + '.json', function(error, response) {
		if(!error && response.statusCode == 200) {
			cb(response.body[0].data.children[0].data.author);
		}else{
			cb(false);
		}
	});
}

module.exports = {
	getliveusers: getliveusers,
	shuffle: shuffle,
	getredditname: getredditname,
	inarray: inarray
};
