var jwt = require('express-jwt');
var config = require('../config/app.js');

var auth = jwt({
    secret: config.secret,
    userProperty: 'payload'
});

module.exports.auth = auth;