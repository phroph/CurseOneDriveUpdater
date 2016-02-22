var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var CLIENT_SECRET = process.env.CLIENT_SECRET;
var CLIENT_ID = process.env.CLIENT_ID;



var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var api = require('./routes/api');

var OAuth2Strategy = require('passport-oauth2').Strategy;

var app = express();

var passport = require('passport');

var User = require('./models/User.js');

passport.use(new OAuth2Strategy({
      tokenURL: 'https://login.live.com/oauth20_token.srf',
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      scope: 'onedrive.appfolder wl.emails wl.offline_access wl.signin ',
      authorizationURL: 'https://login.live.com/oauth20_authorize.srf',
      callbackURL: "http://localhost:3000/auth/onedrive/callback"
    },
    function(accessToken, refreshToken, response, profile, done) {
        console.log(response);
        request.get('https://apis.live.net/v5.0/me?access_token=' + accessToken, function(err, body, WLresponse) {
            User.findOrCreate({ email: JSON.parse(WLresponse).emails.preferred, userId: response.user_id, accessToken: accessToken, refreshToken: refreshToken, expiration: (Date.now() + (response.expires_in*1000)) }, function (err, user) {
                return done(err, user);
            });
        });
    })
);

passport.serializeUser(function(user, done) {
    console.log("Serializing: " + user.id);
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    console.log("Deserializing: " + id);
    User.findOne({ '_id' : id}, function(err, user) {
        if(err) {
            done(err);
        } if(!user) {
            done(null,false);
        } else {
            if(Date.now() > user.onedrive.expiration) {
                console.log('Refreshing access token.');
                request.post({ url: 'https://login.live.com/oauth20_token.srf', form: { client_id: CLIENT_ID, redirect_uri: 'http://localhost:3000/auth/onedrive/callback', refresh_token: user.onedrive.refreshToken, client_secret: CLIENT_SECRET, grant_type: 'refresh_token'}}, function(err, response, body) {
                    user.onedrive.accessToken = body.access_token;
                    user.onedrive.refreshToken = body.refresh_token;
                    user.onedrive.expiration = Date.now() + (body.expires_in * 1000);
                    done(null, user);
                });
                return;
            }
            console.log('Token still valid.');
            done(null, user);
        }
    });
});

// mongoose

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/passport_local_mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("Connected to MongoDB");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);
app.use('/api', api);

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
