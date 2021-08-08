const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const mongoosePaginate = require('mongoose-paginate');
const SchemaTypes = mongoose.Schema.Types;
const moment = require('moment');  

const Schema = mongoose.Schema;

const ExpenseRevision = new Schema({
    id: {
        type: Number,
        unique: true,
        sparse:true
    },
     itemName: {
        type: String
    },
    itemsQuantity: {
        type: Number
    },
    itemQuanExpenPrice:{
        type: SchemaTypes.Double
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

ExpenseRevision.plugin(mongoosePaginate);

ExpenseRevision.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("ExpenseRevision", ExpenseRevision);