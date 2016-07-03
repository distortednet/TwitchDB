const express = require('express');
const swig = require('swig');
const markedSwig = require('swig-marked');
const extras = require('swig-extras');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const helpers = require('./helpers');
const config = require('./config');
const db = require('./db');
const app = express();
const RDBStore = require('express-session-rethinkdb')(session);

const rethinkstore = new RDBStore({
    connectOptions: {
        servers: [{
            host: config.app.rethink.host,
            port: config.app.rethink.port,
        }],
        db: 'introdb',
        discovery: false,
        pool: true,
        buffer: 50,
        max: 1000,
        timeout: 20,
        timeoutError: 1000,
    },
    table: 'sessions',
    sessionTimeout: 86400000,
    flushInterval: 86400000,
    debug: false,
});

global.__base = `${__dirname}/`;

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
    smartypants: false,
});

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', `${__dirname}/views`);
app.use(express.static(`${__dirname}/pub`));
app.use(cookieParser());
app.use(session({
    secret: config.app.cookie,
    resave: false,
    saveUninitialized: false,
    store: rethinkstore,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(methodOverride());

app.set('view cache', false);
swig.setDefaults({
    cache: false,
});
swig.setFilter('random', helpers.general.random);

app.locals = {
    authurl: config.twitch.authurl,
    rng: Math.floor((Math.random() * 100) + 1),
};

app.use((req, res, next) => {
    if (req.session.token && req.session.name) {
        res.locals.loggedin = true;
        res.locals.name = req.session.name;
        res.locals.isadmin = req.session.isadmin;
    } else {
        res.locals.loggedin = false;
    }

    next();
});

require('./routes')(app);

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.use((err, req, res, next) => {
    console.log(err);
    res.redirect('/');
});

app.listen(config.app.port, () => {
    console.log('listening on:' + config.app.port);
});
