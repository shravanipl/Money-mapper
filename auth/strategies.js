const passport = require('passport');
const {
    Strategy: LocalStrategy
} = require('passport-local');
const {
    Strategy: JwtStrategy,
    ExtractJwt
} = require('passport-jwt');

const {
    User
} = require('../users/models');
const {
    JWT_SECRET
} = require('../config');


// The LocalStrategy gets used while trying to access an Endpoint using a User + Password combination
const localStrategy = new LocalStrategy((username, password, callback) => {
    let user;
    // Step 1: Verify the username exists
    User.findOne({
        username: username
    }).then(_user => {
        user = _user;
        if (!user) {
            // Step 2A: If user is not found on the database, reject promise with an error.
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            });
        }
        // Step 2B: Compare the user's password against the stored password hash by running it against the same algorithm.
        return user.validatePassword(password);
    }).then(isValid => {
        if (!isValid) {
            // Step 3A: If password doesn't match the stored password hash, reject promise with an error.
            console.log("user Invalid");

            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            });

        }
        // Step 3B: If authentication is succesfull, execute the callback callback correctly.
        console.log("user valid");
        return callback(null, user);
    }).catch(err => {
        // Step 4: If an error ocurred at any stage during the process, execute the callback callback correctly.

        if (err.reason === 'LoginError') {
            return callback(null, false, err.message);
        }
        return callback(err, false);
    });
});

// The JwtStrategy gets used while trying to access an Endpoint using a JSON Web Token
const jwtStrategy = new JwtStrategy({
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (token, done) => {
        done(null, token.user);
    }
);

const localPassportMiddleware = passport.authenticate('local', {
    session: false
});
const jwtPassportMiddleware = passport.authenticate('jwt', {
    session: false
});

module.exports = {
    localStrategy,
    jwtStrategy,
    localPassportMiddleware,
    jwtPassportMiddleware
};