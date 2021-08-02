const purchasesController = {};
const Purchases = require('../models/purchases.model');
purchasesController.addPurchase = async (req, res) => {
    try {
      const body = req.body;
      const purchase = new Purchases(body);
      const result = await purchase.save();
  
      res.send({
        message: 'purchase added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This purchase has already been registered',
        })
        .status(500);
      }
      else {
      res
        .send({
          message: 'Error',
          detail: ex
        })
        .status(500);
    }
  }
  };
  module.exports = purchasesController;
