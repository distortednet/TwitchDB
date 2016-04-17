var express = require('express'),
  config = require(__base + 'config'),
  helpers = require(__base + 'helpers'),
  db = require(__base + 'db'),
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
module.exports = router;
