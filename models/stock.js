var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({
    symbol: String,
    data: [Number],
    dates: [String]
});

module.exports = mongoose.model('Stock', Stock);