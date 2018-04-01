var mongoose = require('mongoose');

module.exports = mongoose.model('Conversation', {
    patient : { type : String, default : ""},
    //providers : { type : Array , default : [] },
    providers : [{ type : mongoose.Schema.Types.ObjectId , ref : 'Provider' }],
    messages : [{ type : mongoose.Schema.Types.ObjectId , ref : 'TextMessage' }]
});
