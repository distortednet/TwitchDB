var express = require('express'),
  config = require(__base + 'config'),
  helpers = require(__base + 'helpers'),
  db = require(__base + 'db'),
  swig = require('swig'),
  router = express.Router();


router.post('/feedback/', helpers.middleware.checkAuth(), (req, res, next) => {
  Promise.all([helpers.twitch.profile(req.session.name), db.feedback.generateuuid(req.session.name, Date.now()), db.feedback.find(req.session.name, req.body.touser)]).then((dbres) => {
    req.body.data.anonymous = (req.body.data.anonymous == "true");
    req.body.data.fromuser = req.session.name;
    req.body.data.touser = req.body.touser;
    req.body.data.status = "pending";
    req.body.data.read = false;
    req.body.data.logo = dbres[0].logo;
    req.body.data.uuid = dbres[1];
    if(dbres[2][0]) {
      return db.feedback.update(req.body.data.fromuser, req.body.data.touser, req.body.data);
    } else {
      return db.feedback.send(req.body.touser, req.body.data)
    }
  }).then((final) => {
    res.send("feedback for " + req.body.touser + " submitted");
  });
});

router.post('/feedback/markstatus', helpers.middleware.checkAuth(), (req, res, next) => {
  req.body.read = (req.body.read == "true");
  db.feedback.setreadstatus(req.session.name, req.body.uuid, req.body.read).then((db) => {
    res.send(true);
  });
});
module.exports = router;
