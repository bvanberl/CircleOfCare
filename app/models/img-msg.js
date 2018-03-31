var mongoose = require('mongoose');

module.exports = mongoose.model('ImageMessage', {
    _id: mongoose.Schema.Types.ObjectId,
    filename : {type: String, default: ''},
    datetime: {type: Date},
    postedBy : {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'}
});
