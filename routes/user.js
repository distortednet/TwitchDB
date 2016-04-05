var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router();

router.get('/:username', (req, res, next) => {
  Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username)]).then((result) => {
    res.render('profile_public', { data: result[0][0], api: result[1]});
  })
});

router.get('/:username/feedback', helpers.middleware.checkAuth(), (req, res, next) => {
  db.intro.select(req.params.username).then((db) => {
    res.render('feedback_public', {data: db[0]});
  });
});

module.exports = router;
