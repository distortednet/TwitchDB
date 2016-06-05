var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router();
  var routearr = [
    '/:username',
    '/:username/feedback',
    '/:username/feedback/view',
    '/:username/vods',
    '/:username/edit',
  ];
  routearr.forEach(function(route) {
    router.get(route, (req, res, next) => {
      Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username), helpers.twitch.videos(req.params.username, 6, false), helpers.twitch.videos(req.params.username, 1, true)]).then((result) => {
        if(result[0][0] === undefined) {
          res.redirect('/');
        } else {
          res.render('profile_public', { data: result[0][0], api: result[1], videos: result[2], lastbroadcast: result[3][0]});
        }
      })
    });
  });

router.post('/submit', (req, res, next) => {
  if(req.body.twitchname == req.session.name) {
    req.body["intro_status"] = "pending";
    db.intro.update(req.body).then((db) => {
      res.send('intro submitted and is pending!');
    });
  } else {
      res.send('stop trying to be a leet hax0r');
  }
});
module.exports = router;
