var express = require('express'),
	routeCache = require('route-cache'),
	config = require('./config'),
	bodyParser = require('body-parser'),
	app = express(),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	needle = require('needle'),
	swig = require('swig'),
	async = require('async'),
	thinky = require('thinky')({
		host: config.app.rethink.host,
		port: config.app.rethink.port,
		db: config.app.rethink.db
	}),
	r = thinky.r,
	type = thinky.type,
	db = require('./db.js'),
	jsonfile = require('jsonfile');

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/views/static'));
app.use(cookieParser());
app.use(session({secret: 'anything', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view cache', config.app.cache);
swig.setDefaults({ cache: config.app.cachetype });

var UserModel = thinky.createModel("users", config.app.rethink.schema, config.app.rethink.pk);

function checkAuth(req, res, next) {
	if(!req.session.name) {
		res.render('message', {data: 'Please log in to access this page'});
	}else{
		next();
	}

}

function ismod(username) {
	return config.twitch.mods.indexOf(username) > -1;
}

app.locals = {
	title: 'twitchdb',
	appurl: config.app.baseurl,
	clientid: config.twitch.cid,
	authurl: 'https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=' + config.twitch.cid + '&redirect_uri=' + config.app.baseurl + 'auth/&scope=user_read',
	rng: Math.floor((Math.random() * 900000) + 10000)
}
/* gets */
app.get('*', function(req, res, next) {
	app.locals.loggedin = req.session.name;

	next();
});
app.get('/', routeCache.cacheSeconds(300), function(req, res) {
	async.waterfall([
		function(callback) {
			db.GetOnlineUsers(function(dbres) {
				callback(dbres);
			});
		}
	], function(result) {
		res.render('index', {data: result.splice(0, 5)});
	});
});
app.get('/streams', routeCache.cacheSeconds(300), function(req, res) {
	db.GetOnlineUsers(function(dbres) {
		var filterlist = [];

		for(var i in dbres) {
			filterlist.push({
				'game': dbres[i].game,
				'viewers': dbres[i].viewers,
				'video_height': dbres[i].video_height
			});
		}

		res.render('streams', {data: dbres, filter: filterlist});
		filterlist = null;
	});
});
app.get('/api/streams/json', routeCache.cacheSeconds(300), function(req, res) {
	jsonfile.readFile('data.json', function(err, obj) {
		var result = {'error': 'no file found'};
		if(!err) result = obj;
		res.json(result);
	});
});
app.get('/database', function(req, res) {
	db.AdminGetIntroStatus('approved', function(dbres) {
		res.render('database', {data: dbres});
	});
});
app.get('/contact', function(req, res, next) {
	res.render('contact');
});
app.get('/faq', function(req, res, next) {
	res.render('faq');
});
app.get('/about', function(req, res, next) {
	res.render('about');
});
app.get('/disclaimer', function(req, res, next) {
	res.render('disclaimer');
});
app.get('/createintro', checkAuth, function(req, res, next) {
	UserModel.get(req.session.name).run().then(function(dbres) {
		res.render('createintro', {data: dbres});
	}).catch(thinky.Errors.DocumentNotFound, function(err) {
		res.render('createintro', {error: true});
	});
});
app.get('/auth', function(req, res) {
	needle.post('https://api.twitch.tv/kraken/oauth2/token', {
		client_id: config.twitch.cid,
		client_secret: config.twitch.secret,
		grant_type: 'authorization_code',
		redirect_uri: config.app.baseurl + 'auth/',
		code: req.query.code
	}, function(err, resp, body) {
		if(!err) {
			needle.get('https://api.twitch.tv/kraken/user?oauth_token=' + body.access_token, needleoptions, function(error, data) {
				if(!error && data.statusCode == 200) {
					req.session.auth = body.access_token;
					req.session.name = data.body.name;
					res.redirect('/profile');
				}else{
					res.status(404).send('Unable to Authenticate.');
				}
			});
		}else{
			res.status(404).send('OAuth API is being a butt.');
		}
	});
});
app.get('/feedback/:id', checkAuth, function(req, res, next) {
	res.status(404).send('The feedback section is being overhauled. Sorry! D:');
});

app.get('/admin/:type/:status', checkAuth, function(req, res, next) {
	if(ismod(req.session.name)) {
		switch(req.params.type) {
			case 'intro':
				switch(req.params.status) {
					case 'pending':
						db.AdminGetIntroStatus('pending', function(dbres) {
							res.render('admin', {
								view: 'pending',
								data: dbres
							});
						});
						break;
					case 'approved':
						db.AdminGetIntroStatus('approved', function(dbres) {
							res.render('admin', {
								view: 'approved',
								data: dbres
							});
						});
						break;
					case 'rejected':
						db.AdminGetIntroStatus('rejected', function(dbres) {
							res.render('admin', {
								view: 'rejected',
								data: dbres
							});
						});
						break;
					default:
						res.render('admin', {
							view: 'admin'
						});
				}
				break;
			case 'feedback':
				res.status(404).send('feedback');
				break;
			default:
				res.status(404).send('invalid type');
		}
	}else{
		res.redirect('/logout');
	}
});
app.get('/admin/', checkAuth, function(req, res, next) {
	if(ismod(req.session.name)) {
		res.render('admintools');
	}else{
		res.redirect('/logout');
	}
});
app.get('/profile/u/:username', function(req, res, next) {
	db.SelectUser(req.params.username, function(dbres) {
		if(dbres) {
			needle.get('https://api.twitch.tv/kraken/channels/' + req.params.username, function(error, krakken) {
				var data = {data: dbres};

				if(!error && krakken.statusCode == 200) {
					data.krakken = krakken.body;
				}

				res.render('introprofile', data);
			});
		}else{
			res.render('introprofile', {data: dbres});
		}
	});
});
app.get('/profile', checkAuth, function(req, res) {
	UserModel.get(req.session.name).run().then(function(dbres) {
		res.render('profile', {data: dbres, ismod: ismod(req.session.name)});
	}).catch(thinky.Errors.DocumentNotFound, function() {
		var UserData = new UserModel({twitchname: req.session.name});

		UserData.save(function(err) {
			if(err) throw err;

			res.status(200).send('New profile created! <a href="/profile">Continue to Profile</a>');
		});
	});
});

app.get('/logout', checkAuth, function(req, res) {
	req.session.destroy(function() {
		res.redirect('/');
	});
});

/* posts */
app.post('/admin/submit', checkAuth, function(req, res, next) {
	if(ismod(req.session.name)) {
		req.body.intro_approved = (req.body.intro_approved == "true"); //transform string into bool
		req.body.intro_rejected = (req.body.intro_rejected == "true"); //transform string into bool
		if(req.body.profile_data === null || req.body.profile_data === '') {
			req.body.profile_data = null;
		}
		UserModel.get(req.body.twitchname).run().then(function(dbuser) {
			dbuser.merge(req.body).save().then(function(dbres) {
				res.status(200).send("changes made to: " + req.body.twitchname);
			});
		});
	} else {
		res.status(404).send('no mod access');
	}
});
app.post('/admin/searchuser', checkAuth, function(req, res, next) {
	if(ismod(req.session.name)) {
		db.SelectUser(req.body.twitchname, function(dbres) {
			if(dbres) {
				res.json(dbres);
			} else {
				res.json({"error": "could not find a user by that account"});
			}
		});
	} else {
		res.status(404).send('no mod access');
	}
});
app.post('/createintro/submit', checkAuth, function(req, res, next) {
	var date = new Date();

	req.body.intro_approved = (req.body.intro_approved == 'true'); //transform string into bool
	req.body.intro_rejected = (req.body.intro_rejected == 'true'); //transform string into bool
	req.body.intro_date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();

	UserModel.get(req.body.twitchname).run().then(function(dbuser) {
		dbuser.merge(req.body).save().then(function(dbres) {
			res.status(200).send('Intro submitted and awaiting approval!');
		});
	});
});
app.get('*', function(req, res, next) {
	res.render('404');
});

var server = app.listen(config.app.port, function() {
	console.log('listening on:' + config.app.port);
});
