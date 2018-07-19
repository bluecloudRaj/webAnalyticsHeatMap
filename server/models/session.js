var config = require('../config/app.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    visitor: { type: String, required: true},
    page: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId },
    websiteId: { type: Schema.Types.ObjectId, ref: 'User' },
    meta: {
        agent: {
            browser: { type: String, required: true },
            os: { type: String, required: true },
            device: { type: String }
        },
        ip: { type: String, required: true },
        width: { type: Number, required: true},
        height: { type: Number, required: true},
        scrollX: { type: Number, required: true},
        scrollY: { type: Number, required: true},
        createdAt: { type: Date, required: true}
    },
    actions: [{
        type: { type: Number, required: true},
        x: { type: Number, required: true},
        y: { type: Number, required: true},
        createdAt: { type: Date, required: true}
    }]
}, { timestamps: false });

mongoose.model('Session', SessionSchema);