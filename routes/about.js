var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router(),
  marked = require('marked');

router.get('/', (req, res, next) => {
  db.intro.selectadmins().then((dbres) => {
    for (admin of dbres) {
      admin.intro_data.intro_about = marked(admin.intro_data.intro_about);
    }
    res.render('about', {admins: dbres, page: 'About'});
  });
});

module.exports = router;
