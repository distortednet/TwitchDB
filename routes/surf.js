var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  router = express.Router();

router.get('/', (req, res, next) => {
  db.intro.randomintro().then((db) => {
    res.render('surf', { 'user': db[0]});
  });
});

module.exports = router;
