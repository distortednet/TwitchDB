var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  router = express.Router();


router.get('/', (req, res, next) => {
  db.intro.mostrecent(0, 20).then((db) => {
    res.render('search', {data: db, page: 'Search'});
  })
});

module.exports = router;
