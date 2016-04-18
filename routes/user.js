var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router();

router.get('/:username', (req, res, next) => {
  Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username), helpers.twitch.videos(req.params.username, 6)]).then((result) => {
    res.render('profile_public', { data: result[0][0], api: result[1], videos: result[2]});
  })
});

router.get('/:username/feedback', helpers.middleware.checkAuth(), (req, res, next) => {
  Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username), helpers.twitch.videos(req.params.username, 6)]).then((result) => {
    res.render('profile_public', { data: result[0][0], api: result[1], videos: result[2]});
  })
});

router.get('/:username/vods', (req, res, next) => {
  Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username), helpers.twitch.videos(req.params.username, 6)]).then((result) => {
    res.render('profile_public', { data: result[0][0], api: result[1], videos: result[2]});
  })
});
router.get('/:username/social', (req, res, next) => {
  Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username), helpers.twitch.videos(req.params.username, 6)]).then((result) => {
    res.render('profile_public', { data: result[0][0], api: result[1], videos: result[2]});
  })
});
module.exports = router;
