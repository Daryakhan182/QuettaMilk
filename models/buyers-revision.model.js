const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const moment = require('moment');  
const BuyersRevision = new Schema({
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
    mUnitPrice: {
        type: SchemaTypes.Double
    },
    yUnitPrice: {
        type: SchemaTypes.Double
    },
    buyerType: {
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

BuyersRevision.plugin(mongoosePaginate);

BuyersRevision.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("BuyersRevision", BuyersRevision);