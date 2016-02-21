var express = require('express');
var router = express.Router();
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
  User.findOne({ _id: req.user._id }, function(err, user) {
    user.mods = req.body.mods.split(',');
    user.save(function(err, user) {
      res.redirect('http://localhost:3000/Users');
    })
  })
});

module.exports = router;
