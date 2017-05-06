var express = require('express'),
  config = require(__base + 'config'),
  helpers = require(__base + 'helpers'),
  db = require(__base + 'db'),
  swig = require('swig'),
  router = express.Router();

router.get('/search', (req, res, next) => {
  if(req.query.search.length > 2) {
    db.intro.search(req.query.search, req.query.search, "intro_date").then((db) => {
      if(db) {
        res.render('search-partial', { data: db});
      } else {
        res.send(false);
      }
    })
  } else {
    res.send(false);
  }
});
router.get('/about', (req, res, next) => {
  helpers.twitch.profile(req.query.twitchname).then((result) => {
    res.send({twitchname: result._id, logo: result.logo});
  })
})
// router.get('/user/:name', (req, res, next) => {
//   db.intro.select(req.params.name).then((result) => {
//     res.send(result[0].intro_data);
//   });
// });
router.post('/vote', helpers.middleware.checkAuth(), (req, res, next) => {
  db.intro.select(req.body.twitchname).then((data) => {
    var data = data[0];
    if(data.votes) {
      if(helpers.general.inarray(req.body.voter, data.votes)) {
        res.send('Sorry, you have already voted!');
      } else {
        data.votes.push(req.body.voter);
        db.intro.update({'twitchname': req.body.twitchname, 'votes': data.votes}).then((dbres) => {
          res.send("you have succesfully voted!");
        })
      }
    } else {
      db.intro.update({'twitchname': req.body.twitchname, 'votes': [req.body.voter]}).then((dbres) => {
        res.send("you have succesfully voted!");
      })
    }
  });
});
module.exports = router;
