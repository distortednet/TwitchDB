var args = process.argv.slice(2);
var config = {};

config.app = {};
config.twitch = {};
config.app.rethink = {};

switch (args[0]) {
	case 'dev':
		config.app.port = "8080";
		config.app.baseurl = "http://localhost:"+config.app.port+"/";
		config.app.rethink.host = "192.168.1.119";
		config.app.rethink.port = "28015";
		config.app.cache = false;
		config.app.cachetype = false;
		config.twitch.cid = "";
		config.twitch.secret = "";
	break;
	case 'beta':
		config.app.port = "8081";
		config.app.baseurl = "http://beta.twitchdb.tv/";
		config.app.rethink.host = "localhost";
		config.app.rethink.port = "28015";
		config.app.cache = false;
		config.app.cachetype = false;
		config.twitch.cid = "";
		config.twitch.secret = "";
	break;
	case 'production':
		config.app.port = "8080";
		config.app.baseurl = "http://www.twitchdb.tv/";
		config.app.rethink.host = "localhost";
		config.app.rethink.port = "28015";
		config.app.cache = false;
		config.app.cachetype = 'memory';
		config.twitch.cid = "";
		config.twitch.secret = "";
	break;
	default:
		throw "must select dev, beta, or production";
	break;
}
var	thinky = require('thinky')({host:config.app.rethink.host, port:config.app.rethink.port, db: config.app.rethink.db}),
	r = thinky.r,
	type = thinky.type,
	Query = thinky.Query;

config.app.rethink.schema =  {
	twitchname: type.string(),
	redditname: type.string(),
	intro_approved: type.boolean(),
	intro_rejected: type.boolean(),
	intro_date:  type.string(),
	profile_data: type.object()
};
config.app.rethink.pk = {pk: "twitchname"};

config.app.rethink.db = "introdb";
config.twitch.mods = ["distortednet", "shannonzkiller", "boomliam", "tarfu", "kanthes", "mellownebula", "bigpace"];
config.twitch.callback = config.app.baseurl + "auth";


module.exports = config;
