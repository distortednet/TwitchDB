var express = require('express'),
  config = require('../config'),
  db = require('../db'),
  router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  db.intro.randomintro().then((db) => {
    res.render('surf', {'user': db[0], page: 'Channel Surf: ' + db[0].channel.name});
  });
});

module.exports = router;
