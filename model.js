var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * MONGOOSE DRIVER CONNECTION
 */
mongoose.connect(config.values.mongodb_addr, function (err) {
    if (err) {
        throw err;
    }
    console.log("connected to mongoDB");
});

var ClientSchema = new Schema({
    id: String,
    secret: String,
    grantTypes: [],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});


exports.ModelContainer = {
   ClientModel : mongoose.model('Client', ClientSchema)
};