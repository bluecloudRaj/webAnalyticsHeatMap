var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err) { 
                return done(err);
            }

            if (!user) {
                return done(null, false, {error: 1, message: 'User not found'});
            }

            if (!user.checkPassword(password)) {
                return done(null, false, {error: 1, message: 'Password is wrong'});
            }

            return done(null, user);
        });
    }
));