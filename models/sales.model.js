const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const Sale = new Schema({
    id: {
        type: Number,
        unique: true,
        sparse:true
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
    }
});

Sale.plugin(mongoosePaginate);

Sale.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("Sale", Sale);