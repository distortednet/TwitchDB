// dependencies
var express = require('express'),
  swig = require('swig'),
  markedSwig = require('swig-marked'),
  extras = require('swig-extras'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  helpers = require('./helpers'),
  config = require('./config'),
  db = require('./db'),
  app = express();
  var RDBStore = require('express-session-rethinkdb')(session);
// app config

var rethinkstore = new RDBStore({
  connectOptions: {
    servers: [{ host: config.app.rethink.host, port: config.app.rethink.port }],
    db: 'introdb',
    discovery: false,
    pool: true,
    buffer: 50,
    max: 1000,
    timeout: 20,
    timeoutError: 1000
  },
  table: 'sessions',
  sessionTimeout: 86400000,
  flushInterval: 20000,
  debug: false
});

global.__base = __dirname + '/';

markedSwig.useFilter(swig);
extras.useFilter(swig, 'truncate');
markedSwig.useTag(swig);
markedSwig.configure({
  gfm: false,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: false,
  smartypants: false
});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/pub'));
app.use(cookieParser());
app.use(session({
  secret: config.app.cookie,
  resave: false,
  saveUninitialized: false,
  store: rethinkstore
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

app.set('view cache', false);
swig.setDefaults({cache: false});

swig.setFilter('random', helpers.general.random);

app.locals = {
	authurl: config.twitch.authurl,
  rng: Math.floor((Math.random() * 100) + 1),
};

app.use(function(req, res, next){
  // res.locals.user = req.user;
  // res.locals.authenticated = ! req.user.anonymous;
  if(req.session.token && req.session.name) {
		res.locals.loggedin = true;
		res.locals.name = req.session.name;
    res.locals.isadmin = req.session.isadmin;
	} else {
		res.locals.loggedin = false;
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

app.use(function(err, req, res, next) {
  console.log(err);
  res.redirect('/');
});

// serve that shizz
var server = app.listen(config.app.port, () => {
	console.log('listening on:' + config.app.port);
});
