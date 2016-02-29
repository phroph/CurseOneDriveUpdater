/**
 * Created by Phtoph on 2/18/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    mods: [String],
    onedrive: {
        userId: String,
        expiration: Number,
        accessToken: String,
        refreshToken: String
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
module.exports.findOrCreate = function(args, done) {
    module.exports.findOne({'username' : args.email}, function(err, user) {
        if(err) {
            console.log('Err: ' + err);
            done(err, null);
            return;
        } else {
            if(user == null) {
                module.exports.create({ 'username': args.email, 'onedrive.userId': args.userId, 'onedrive.accessToken': args.accessToken, 'onedrive.refreshToken' : args.refreshToken, 'onedrive.expiration' : args.expiration}, function (err, usr) {
                    if (err) {
                        done(err, null);
                    } else {
                        done(null, usr);
                    }
                })
            } else {
                console.log('Found user: ' + user.onedrive.userId);
                // Update all info in case anything changes.
                user.onedrive.userId = args.userId;
                user.onedrive.refreshToken = args.refreshToken;
                user.onedrive.accessToken = args.accessToken;
                user.onedrive.expiration = args.expiration;
                user.save(function(err, user) {
                    done(null, user);
                })
            }
        }
    });
}