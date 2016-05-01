var express = require('express'),
  router = express.Router();


router.get('/u/:username', (req, res, next) => {
  res.redirect('/user/'+req.params.username);
});

module.exports = router;
