var express = require('express'),
  config = require('../config'),
  router = express.Router();

router.get('/', (req, res, next) => {
  res.render('disclaimer');
});

module.exports = router;
