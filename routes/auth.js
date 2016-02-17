var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/onedrive', passport.authenticate('oauth2'));

router.get('/onedrive/callback',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

module.exports = router;
