var express = require('express');
var request = require('request');
var CLIENT_ID = process.env.CLIENT_ID;
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/onedrive', passport.authenticate('oauth2'));

router.get('/onedrive/logout', function(req, res) {
    if(req.user) {
        res.redirect('https://login.live.com/oauth20_logout.srf?client_id='+ CLIENT_ID + '&redirect_uri=http://localhost:3000/auth/onedrive/callback');
        req.logout();
    }
});

router.get('/onedrive/callback',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

module.exports = router;
