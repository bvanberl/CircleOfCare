var mongoose = require('mongoose');

module.exports = mongoose.model('Patient', {
    _id: mongoose.Schema.Types.ObjectId,
    name : {type: String, default: ''},
    addedBy : {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'}
});
