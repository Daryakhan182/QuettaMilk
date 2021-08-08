const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const moment = require('moment');  

const PurchaseRevision = new Schema({
    id: {
        type: Number,
        unique: true,
        sparse:true
    },
     venderName: {
        type: String
    },
    address: {
        type: String
    },
    contact: {
        type: [Number]
    },
    itemName: {
        type: String
    },
    itemQuantity: {
        type: Number
    },
    itemPrice: {
        type: SchemaTypes.Double
    },
    totalPrice: {
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

PurchaseRevision.plugin(mongoosePaginate);

PurchaseRevision.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("PurchaseRevision", PurchaseRevision);