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
    res.render('stream-partial', { streams: result, isapi: true});
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
    db.cache.search(req.query.game).then((db) => {
      var tpl = swig.compileFile('./views/stream-partial.html');
      res.send(tpl({streams: db}));
    })
  } else {
    db.cache.games().then((db) => {
      res.render('game-partial', { data: db});
    })
  }

  // db.cache.games().then((games) => {
  //   db.cache.search(games).then((db) => {
  //     res.send(db);
  //   })
  // })
  // if(req.query.game) {
  //   db.cache.search(req.query.game).then((db) => {
  //     res.render('stream-partial', { data: db});
  //   })
  //   res.send("butts");
  // } else {
  //   db.cache.games().then((db) => {
  //     res.render('game-partial', { data: db});
  //   })
  // }

  // if(req.query.start) {
  //   var start = parseInt(req.query.start);
  //   var end = parseInt(req.query.end);
  // } else {
  //   var start = 0;
  //   var end = 12;
  // }
  //
  // res.send("butts");
  // db.cache.online(parseInt(start), parseInt(end)).then((users) => {
  //   return helpers.twitch.boxart(users)
  // }).then((boxart) => {
  //   console.log(boxart);
  // })
  // // db.cache.online(parseInt(start), parseInt(end)).then((users) => {
  // //   return helpers.twitch.boxart(users);
  // // }).then((test) => {
  // //   console.log('wot');
  // //   res.send("butts");
  // // })

});


module.exports = router;
