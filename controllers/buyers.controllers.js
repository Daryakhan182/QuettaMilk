const buyersController = {};
const Buyers = require('../models/buyers.model');
const path = require('path');
//const jsonwebtoken =  require('jsonwebtoken');

buyersController.addBuyer = async (req, res) => {
    try {
      const body = req.body;
      const buyer = new Buyers(body);

      const result = await buyer.save();
  
      res.send({
        message: 'Buyer added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This buyer has already been registered',
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
  buyersController.updateBuyer = async (req, res) => {
    if (!req.params._id) {
      res.status(500).send({
        message: 'ID missing'
      });
    }
    try {
      const _id = req.params._id;
      let updates = req.body;
      runUpdate(_id, updates, res);
    } catch (error) {
      console.log('error', error);
      return res.status(500).send(error);
    }
  };

  async function runUpdate(_id, updates, res) {
    try {
      const result = await Buyers.updateOne(
        {
          _id: _id
        },
        {
          $set: updates
        },
        {
          upsert: true,
          runValidators: true
        }
      );
  
      {
        if (result.nModified == 1) {
          res.status(200).send({
            code: 200,
            message: 'Updated Successfully'
          });
        } else if (result.upserted) {
          res.status(200).send({
            code: 200,
            message: 'Created Successfully'
          });
        } else {
          res.status(422).send({
            code: 422,
            message: 'Unprocessible Entity'
          });
        }
      }
    } catch (error) {
      console.log('error', error);
      return res.status(500).send(error);
    }
  }

  module.exports = buyersController;
