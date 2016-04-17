var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router();

router.get('/:username', (req, res, next) => {
  Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username), helpers.twitch.videos(req.params.username, 6)]).then((result) => {
    res.render('profile_public', { data: result[0][0], api: result[1], videos: result[2]});
  })
})

router.get('/:username/feedback', helpers.middleware.checkAuth(), (req, res, next) => {
  res.render('profile_public');
  // Promise.all([db.intro.select(req.params.username), db.feedback.find(req.session.name, req.params.username)]).then((db) => {
  //   res.render('feedback_public', {data: db[0][0], feedback: db[1][0]});
  // });
});

module.exports = router;
