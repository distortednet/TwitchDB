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

});




router.get('/tools', (req, res, next) => {
  res.render('admin/tools');
});
router.post('/tools', (req, res, next) => {
  db.intro.search(req.body.username, null).then((db) => {
    res.send(db[0]);
  });
});
router.post('/tools/update', (req, res, next) => {
  db.intro.update(req.body).then((db) => {
    res.send("updated profile for " + req.body.twitchname);
  });
});
router.post('/submit', (req, res, next) => {
  db.intro.setstatus(req.body.twitchname, req.body.intro_status).then((dbres) => {
    res.send(req.body.twitchname + " has been " + req.body.intro_status);
  })
});
module.exports = router;
