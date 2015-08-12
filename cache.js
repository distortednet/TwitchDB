var config = require('./config'),
  		needle = require('needle'),
      batch = require('batchflow'),
	thinky = require('thinky')({
		host: config.app.rethink.host,
		port: config.app.rethink.port,
		db: config.app.rethink.db
	}),
	r = thinky.r,
	type = thinky.type,
	helpers = require('./helpers');

var CacheModel = thinky.createModel('onlinecache',   {streams: type.object()});
var UserModel = thinky.createModel('users', config.app.rethink.schema, config.app.rethink.pk);

CacheModel.delete().then(function(result) {});

UserModel.filter({'intro_approved': true, 'intro_rejected': false}).pluck('twitchname').run().then(function(users) {
	var userarray = [];
	for(var i in users) {
		userarray.push(users[i].twitchname);
	}
  chunked = helpers.chunks(userarray, 100);
  var chunklist = [];
  for(var i in chunked) {
    chunklist.push('https://api.twitch.tv/kraken/streams?channel=' + chunked[i].join(','));
  }
  batch(chunklist).parallel().each(function(i, url, done) {
    needle.get(url, function(err, res) {
      if("body" in res) {
        done(res.body);
      } else {
        console.log("couldn't fetch data");
        process.exit();
      }
    });
  }).end(function(final) {
    data = [];
    for(var i in final) {
      for(var x in final[i].streams) {
        data.push({streams: final[i].streams[x]})
      }
    }
    CacheModel.save(data).then(function(result) {
      process.exit();
    }).error(function(error) {
      console.log(error);
    });
  });
});
