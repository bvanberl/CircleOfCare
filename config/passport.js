var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Provider = mongoose.model('Provider');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    Provider.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));
