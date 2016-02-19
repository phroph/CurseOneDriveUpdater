/**
 * Created by Phtoph on 2/18/2016.
 */
var express = require('express');
var request = require('request');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/User', function(req, res) {
   if(req.user) {
       request.get('https://apis.live.net/v5.0/me?access_token=' + req.user.onedrive.accessToken).pipe(res);
   }
});
module.exports = router;
