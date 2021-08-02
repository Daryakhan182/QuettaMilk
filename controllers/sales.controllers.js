const salesController = {};
const Sales = require('../models/sales.model');
salesController.addSale = async (req, res) => {
    try {
      const body = req.body;
      const sale = new Sales(body);
      const result = await sale.save();
  
      res.send({
        message: 'sale added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This sale has already been registered',
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
  module.exports = salesController;
