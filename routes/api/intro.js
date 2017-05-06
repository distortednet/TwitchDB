var express = require('express'),
    config = require(__base + 'config'),
    helpers = require(__base + 'helpers'),
    db = require(__base + 'db'),
    swig = require('swig'),
    router = express.Router();

router.get('/status/:id/', (req, res, next) => {
  db.intro.select(req.params.id).then(function(data) {
    if (data[0]) {
      if (data[0].intro_status) {
        res.send({ status: 404, message: "has_intro", intro_status: data[0].intro_status });
      }
      else {
        res.send({ status: 404, message: "no_intro" });
      }
    }
    else {
      res.send({ status: 404, message: "no_account" });
    }
  });
});

module.exports = router;
