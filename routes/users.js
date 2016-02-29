var express = require('express');
var router = express.Router();
var daemon = require('../src/daemon.js');
var User = require('../models/User.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.user) {
    var list = '';
    for(var mod in req.user.mods) {
      if(mod == '_schema') {}
      else if(list == '') {
        list += req.user.mods[mod];
      } else {
        list += ',' + req.user.mods[mod];
      }
    }
    res.render('user', { modslist: list });
  } else {
    res.redirect('http://localhost:3000/auth/onedrive');
  }
});

router.post('/updatelist', function(req, res) {
  if(req.user) {
    User.findOne({_id: req.user._id}, function (err, user) {
      user.mods = req.body.mods.split(',');
      user.save(function (err, user) {
        // trigger an update and redirect the user while we update.
        daemon.updateUser(user);
        res.redirect('http://localhost:3000/Users');
      })
    })
  } else {
    res.redirect('http://localhost:3000/auth/onedrive');
  }
});

module.exports = router;
