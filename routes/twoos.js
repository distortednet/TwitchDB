var express = require('express'),
  swig = require('swig'),
  config = require('../config'),
  helpers = require('../helpers'),
  db = require('../db'),
  router = express.Router();

router.get('/', (req, res, next) => {
  if(req.query.id) {
    db.intro.twoos(req.query.id).then((dbres) => {
      res.json(dbres);
    });
  } else {
    res.json({'error': 'no parameter used'});
  }
});

module.exports = router;
