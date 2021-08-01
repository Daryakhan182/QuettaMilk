const sellersController = {};
const Sellers = require('../models/sellers.model');
const path = require('path');
//const jsonwebtoken =  require('jsonwebtoken');

sellersController.addSeller = async (req, res) => {
    try {
      const body = req.body;
      const seller = new Sellers(body);
      const result = await seller.save();
  
      res.send({
        message: 'Seller added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This Seller has already been registered',
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
  module.exports = sellersController;
