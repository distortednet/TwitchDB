var express = require('express'),
  swig = require('swig'),
  config = require('../config'),
  helpers = require('../helpers'),
  db = require('../db'),
  router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', {page: 'Home'});
});

router.get('/top', (req, res, next) => {
    res.render('index', {page: 'Top'});
});

router.get('/random', (req, res, next) => {
    res.render('index', {page: 'Random'});
});

router.get('/mature', (req, res, next) => {
    res.render('index', {page: 'Mature'});
});

router.get('/family', (req, res, next) => {
    res.render('index', {page: 'Not Mature'});
});

router.get('/games', (req, res, next) => {
    res.render('index', {page: 'Games'});
});
router.get('/votes', (req, res, next) => {
    res.render('index', {page: 'Votes'});
});

module.exports = router;
