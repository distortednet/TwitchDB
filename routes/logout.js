var express = require('express'),
  config = require('../config'),
  router = express.Router();

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
		res.redirect('/');
	});
});

module.exports = router;
