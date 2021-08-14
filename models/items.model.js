const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const Item = new Schema({
    id: {
        type: Number,
        unique: true,
        sparse:true
    },
     Itemname: {
        type: String
    },
    countingUnit: {
        type: String
    },
    price: {
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
       type : String,

   },
   groupId:{
       type: Number,
       default: 0
   }
}, {

   versionKey: false // _v:0 is removed from document

});

Item.plugin(mongoosePaginate);

Item.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("Item", Item);