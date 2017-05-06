var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router();

router.get('/', (req, res, next) => {
  db.intro.selectadmins().then((dbres) => {
    res.render('about', {admins: dbres, page: 'About'});
  });
});

module.exports = router;
