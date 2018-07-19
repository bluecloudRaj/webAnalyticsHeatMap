const mongoose = require('mongoose');

// connect to mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/heater'); // mongodb://fant0m:superheslo@ds061196.mlab.com:61196/heater
mongoose.connection.on('error', function(error) {
    console.log(error);
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

// models
require('../models/user');
require('../models/session');