const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const Waistage = new Schema({
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
    totalPrice: {
        type: SchemaTypes.Double
    },
    buyerType: {
        type: String
    }
});

Waistage.plugin(mongoosePaginate);

Waistage.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("Waistage", Waistage);