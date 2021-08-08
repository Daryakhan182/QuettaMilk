const buyersRevisionController = {};
const Buyers = require('../models/buyers-revision.model');
const path = require('path');
buyersRevisionController.addBuyer = async (req, res) => {
    try {
      const body = req.body;
      const buyer = new Buyers(body);

      const result = await buyer.save();
  
      res.send({
        message: 'Buyer Revision added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This buyer Revision has already been registered',
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

  module.exports = buyersRevisionController;
