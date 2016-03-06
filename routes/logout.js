var express = require('express'),
  config = require('../config'),
  router = express.Router();

/* GET home page. */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
		res.redirect('/');
	});
});

module.exports = router;
