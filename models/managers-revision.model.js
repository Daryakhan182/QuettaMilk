const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const moment = require('moment');  

const ManagersRevision = new Schema({
    id: {
        type: Number,
        unique: true,
        sparse:true
    },
     name: {
        type: String
    },
    address: {
        type: String
    },
    contact: {
        type: [Number]
    },
    password: {
        type: String
    },
    role: {
        type: String
    },  
    revision:{
       type: Number,
       default: 0
   },
   status: {
       type: Number,
       default: 0
   },
   timeStamp:{ 
       type : String, default: moment().format('LLL')

   },
   groupId:{
       type: Number,
       default: 0
   }
}, {

   versionKey: false // _v:0 is removed from document

});

ManagersRevision.plugin(mongoosePaginate);

ManagersRevision.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("ManagerRevision", ManagersRevision);