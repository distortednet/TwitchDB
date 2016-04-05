var express = require('express'),
  config = require('../config'),
  helpers = require('../helpers'),
  db = require('../db'),
  router = express.Router();

router.get('/', (req, res, next) => {
  res.render('profile', { title: 'Express' });
});

router.get('/intros/:type', (req, res, next) => {
  db.intro.filter(req.params.type).then((db) => {
    res.render('admin/intros', {type: req.params.type, data: db });
  });
});

router.get('/feedback/:type', (req, res, next) => {
  db.feedback.filter(req.params.type).then(function(db) {
    res.render('admin/feedback', {type: req.params.type, data: db });
  });
});

router.get('/tools', (req, res, next) => {
  res.render('admin/tools');
});
router.post('/tools', (req, res, next) => {
  db.intro.search(req.body.username, null, "intro_date").then((db) => {
    res.send(db[0]);
  });
});
router.post('/tools/update', (req, res, next) => {
  if(req.body.intro_status == "clear") {
    req.body['intro_data'] = null;
    req.body['intro_status'] = null;
  }
  req.body.admin = (req.body.admin == "true");
  db.intro.update(req.body).then((db) => {
    res.send("Profile updated for " + req.body.twitchname);
  });
});
router.post('/submit', (req, res, next) => {
  db.intro.setstatus(req.body.twitchname, req.body.intro_status).then((dbres) => {
    if(req.body.intro_status == 'approved' && dbres[0].redditname) {
      return helpers.general.setredditflair(dbres[0].redditname, dbres[0].twitchname, config.reddit.auth, config.reddit.oauth);
    } else {
      return false;
    }
  }).then(function(final) {
    if(final && final.status == true) {
      res.send(req.body.twitchname + " has been " + req.body.intro_status + " - Flair set for: " + final.data.name);
    } else {
      res.send(req.body.twitchname + " has been " + req.body.intro_status);
    }
  })
});
router.post('/submit/feedback', (req, res, next) => {
  db.feedback.setfeedbackstatus(req.body.twitchname, req.body.uuid, req.body.status).then((dbres) => {
    res.send("Feedback for: " + req.body.twitchname + " has been " + req.body.status);
  });
});
module.exports = router;
