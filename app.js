// dependencies
var express = require('express'),
  swig = require('swig'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  helpers = require('./helpers'),
  config = require('./config'),
  db = require('./db'),
  app = express();

// app config
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/pub'));
app.use(cookieParser());
app.use(session({secret: config.app.cookie, resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view cache', false);
swig.setDefaults({cache: false});

swig.setFilter('random', helpers.general.random);

app.locals = {
	authurl: config.twitch.authurl
};
app.get('*', (req, res, next) => {
  if(req.session.token && req.session.name) {
		app.locals.loggedin = true;
		app.locals.name = req.session.name;
    app.locals.isadmin = req.session.isadmin;
	} else {
		app.locals.loggedin = false;
	}
	next();
});

//routes

require('./routes')(app);

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
		res.redirect('/');
	});
});

// serve that shizz
var server = app.listen(config.app.port, () => {
	console.log('listening on:' + config.app.port);
});
