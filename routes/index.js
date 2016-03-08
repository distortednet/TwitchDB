var express = require('express'),
  config = require('../config'),
  helpers = require('../helpers'),
  db = require('../db'),
  router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index');
});

router.get('/top', (req, res, next) => {
    res.render('index');
});

router.get('/random', (req, res, next) => {
    res.render('index');
});

router.get('/mature', (req, res, next) => {
    res.render('index');
});

router.get('/family', (req, res, next) => {
    res.render('index');
});

router.get('/games', (req, res, next) => {
    res.render('index');
});

module.exports = router;
