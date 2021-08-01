const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const Seller = new Schema({
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
    }
});

Seller.plugin(mongoosePaginate);

Seller.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("Seller", Seller);