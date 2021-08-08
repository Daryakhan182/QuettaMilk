const purchasesRevisionController = {};
const Purchases = require('../models/purchases-revision.model');
purchasesRevisionController.addPurchase = async (req, res) => {
    try {
      const body = req.body;
      const purchase = new Purchases(body);
      const result = await purchase.save();
  
      res.send({
        message: 'purchase revision added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This purchase revision has already been registered',
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
  module.exports = purchasesRevisionController;
