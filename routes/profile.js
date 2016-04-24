var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  helpers = require('../helpers'),
  router = express.Router();


router.get('/', (req, res, next) => {
  Promise.all([db.intro.create(req.session.name), db.intro.select(req.session.name)]).then((result) => {
    res.render('profile', {data: result[1][0]});
  });
});

router.get('/edit', (req, res, next) => {
  db.intro.select(req.session.name).then((db) => {
    res.render('profile', { data: db[0]});
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
router.get('/feedback', (req, res, next) => {
  db.intro.select(req.session.name).then((db) => {
    res.render('profile', { data: db[0]});
  });
});
module.exports = router;
