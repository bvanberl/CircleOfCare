var mongoose = require('mongoose');

module.exports = mongoose.model('Conversation', {
    patient : {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: 'no-name'},
    providers : { type : Array , default : [] },
    messages : {type: Array, default: []}
});
