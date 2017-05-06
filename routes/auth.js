var express = require('express'),
  config = require('../config'),
  helpers = require('../helpers'),
  db = require('../db'),
  router = express.Router();

router.get('/', (req, res, next) => {
  helpers.twitch.auth(config.twitch.cid, config.twitch.secret, config.twitch.grant, config.twitch.redirect, req.query.code).then(function(auth) {
    req.session.token = auth.token;
		req.session.name = auth.name;
    req.session.display_name = auth.display_name;
    req.session.isadmin = auth.modstatus;
    db.intro.create(req.session.name).then((db) => {
      res.redirect('/user/'+req.session.name);
    });
  }).catch(function(e) {
		console.log("error" + err);
  });
});

module.exports = router;
