var express = require('express'),
  config = require('../config'),
  helpers = require('../helpers'),
  db = require('../db'),
  swig = require('swig'),
  router = express.Router();

router.get('/top', (req, res, next) => {
  if(req.query.start) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
  } else {
    var start = 0;
    var end = 12;
  }
  db.cache.online(parseInt(start), parseInt(end)).then((result) => {
    res.render('stream-partial', { streams: result});
  })
});

router.get('/mature', (req, res, next) => {
  if(req.query.start) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
  } else {
    var start = 0;
    var end = 12;
  }
  db.cache.maturefilter(start, end, true).then((result) => {
    res.render('stream-partial', { streams: result});
  })
});

router.get('/family', (req, res, next) => {
  if(req.query.start) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
  } else {
    var start = 0;
    var end = 12;
  }
  db.cache.maturefilter(start, end, false).then((result) => {
    res.render('stream-partial', { streams: result});
  })
});

router.get('/search', (req, res, next) => {
  if(req.query.search.length > 2) {
    db.intro.search(null, req.query.search, "intro_date").then((db) => {
      if(db) {
        res.render('search-partial', { data: db});
      } else {
        res.send(false);
      }
    })
  } else {
    res.send(false);
  }
});
router.get('/games', (req, res, next) => {
  if(req.query.game) {
    db.cache.gamesearch(req.query.game).then((db) => {
      var tpl = swig.compileFile('./views/stream-partial.html');
      res.send(tpl({streams: db}));
    })
  } else {
    db.cache.gamelist().then((db) => {
      var gamelist = [];
      for(i in db) {
        if(db[i].group != null) {
          gamelist.push({'game': db[i].group, 'usercount': db[i].reduction.length})
        }
      }
      res.render('game-partial', { data: gamelist});
    })
  }
});
router.get('/votes', (req, res, next) => {
  db.intro.mostvotes().then((result) => {
    res.render('stream-partial', { streams: result});
  })
});
router.post('/vote', helpers.middleware.checkAuth(), (req, res, next) => {
  db.intro.select(req.body.twitchname).then((data) => {
    var data = data[0];
    if(data.votes) {
      if(helpers.general.inarray(req.body.voter, data.votes)) {
        res.send('Sorry, you have already voted!');
      } else {
        data.votes.push(req.body.voter);
        db.intro.update({'twitchname': req.body.twitchname, 'votes': data.votes}).then((dbres) => {
          res.send("you have succesfully voted!");
        })
      }
    } else {
      db.intro.update({'twitchname': req.body.twitchname, 'votes': [req.body.voter]}).then((dbres) => {
        res.send("you have succesfully voted!");
      })
    }
  });
});

router.post('/feedback/', helpers.middleware.checkAuth(), (req, res, next) => {
  helpers.twitch.profile(req.session.name).then((api) => {
    db.feedback.generateuuid(req.session.name, Date.now()).then((uuid) => {
      req.body.data.anonymous = (req.body.data.anonymous == "true");
      req.body.data.fromuser = req.session.name;
      req.body.data.status = "pending";
      req.body.data.read = false;
      req.body.data.logo = api.logo;
      req.body.data.uuid = uuid;
      console.log(req.body.data);
      return db.feedback.send(req.body.touser, req.body.data);
    }).then((result) => {
      res.send("feedback for " + req.body.touser + " submitted");
    })
  })
});

router.post('/feedback/markstatus', helpers.middleware.checkAuth(), (req, res, next) => {
  req.body.read = (req.body.read == "true");
  db.feedback.setreadstatus(req.session.name, req.body.uuid, req.body.read).then((db) => {
    res.send(true);
  });
});


module.exports = router;
