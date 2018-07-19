const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const helpers = require('./../helpers/helpers');
const logger = require('./../config/log');

module.exports.register = function(req, res) {
    var user = new User({
        'email': req.body.email,
        'password': req.body.password,
        'firstName': req.body.firstName,
        'lastName': req.body.lastName
    });

    user.validate(function(error) {
        if (error) {
            res.status(401).send({'message': helpers.errorMessages(error)});
        } else {
            user.setPassword(req.body.password);
            user.save(function(err) {
                if (err) {
                    logger.error(err);
                    res.status(403).send({'message': helpers.errorMessages(err)});
                } else {
                    var token = user.generateJwt();
                    res.status(200).send({'message': 'You have been sucessfully registered', 'token': token});
                }
            });
        }
    });
};

module.exports.login = function(req, res) {
    passport.authenticate('local', function(err, user, info){
        if (err) {
            logger.error(err);
            res.status(403).json(err);
            return;
        }

        if (user) {
            var token = user.generateJwt();
            res.status(200).json({'token' : token, 'message': 'Login was sucessfull'});
        } else {
            res.status(401).json(info);
        }
    })(req, res);
};