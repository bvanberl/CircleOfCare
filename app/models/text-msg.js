var mongoose = require('mongoose');

module.exports = mongoose.model('TextMessage', {
    _id: mongoose.Schema.Types.ObjectId,
    message : {type: String, default: ''},
    datetime: {type: Date},
    poster : {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'}
});
