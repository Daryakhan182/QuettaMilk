const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const mongoosePaginate = require('mongoose-paginate');
const SchemaTypes = mongoose.Schema.Types;

const Schema = mongoose.Schema;

const Expense = new Schema({
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
    }
});

Expense.plugin(mongoosePaginate);

Expense.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
   }
module.exports = mongoose.model("Expense", Expense);