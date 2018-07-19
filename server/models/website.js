var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Session = require('./session');

var WebsiteSchema = new Schema({
    url: { 
        type: String,
        required: [true, 'Url is required'],
        // @todo odkomentovat
        // match: [/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/, 'Url address is not valid']
    },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    settings: {
        layout: { type: Number, default: 1 },
        viewportDesktop: { type: Number, default: 1200 }
    },
    pages: [{
        page: { type: String, required: true },
        content: { type: String, required: true },
    }],
    sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }]
}, { timestamps: true });

module.exports = WebsiteSchema;