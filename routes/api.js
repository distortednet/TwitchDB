var express = require('express'),
  config = require('../config'),
  db = require('../db'),
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
    db.intro.search(null, req.query.search).then((db) => {
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
module.exports = router;
