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
      Promise.all([db.intro.select(req.params.username), helpers.twitch.profile(req.params.username)]).then((result) => {
        if(result === undefined && result[0][0] === undefined && result[1] === undefined && result[3][0] === undefined) {
          res.redirect('/');
        } else {
          res.render('profile_public', { data: result[0][0], api: result[1], page: result[0][0].twitchname});
        }
      }).catch(reason => {
        res.redirect('/');
        // console.log(reason);
      });
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
