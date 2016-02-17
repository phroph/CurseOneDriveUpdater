var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var OAuth2Strategy = require('passport-oauth2').Strategy;

var app = express();

var passport = require('passport');

passport.use(new OAuth2Strategy({
      tokenURL: 'https://login.live.com/oauth20_token.srf',
      clientID: '-',
      clientSecret: '-',
      scope: 'onedrive.appfolder wl.offline_access',
      authorizationURL: 'https://login.live.com/oauth20_authorize.srf',
      callbackURL: "http://localhost:3000/auth/onedrive/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate({ exampleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
