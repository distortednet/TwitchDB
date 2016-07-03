var express = require('express'),
  config = require('../config'),
  router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('faq', { title: 'Express', page: 'FAQ' });
});

module.exports = router;
