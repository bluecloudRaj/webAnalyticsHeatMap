var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../config/app.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WebsiteSchema = require('./website');

var UserSchema = new Schema({
    email: { 
        type: String, 
        required: [true, 'Email address is required'],
        unique: [true, 'Email address is already in use'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/, 'Email address is not valid']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must have at least 6 characters']
    },
    salt: String,
    firstName: { type: String },
    lastName: { type: String },
    websites: [WebsiteSchema],
    admin: Boolean,
}, { timestamps: true });

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 100000, 512, 'sha512').toString('hex');
};

UserSchema.methods.checkPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 100000, 512, 'sha512').toString('hex');
    return hash === this.password;
};

UserSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        exp: parseInt(expiry.getTime() / 1000),
    }, config.secret);
};

mongoose.model('User', UserSchema);