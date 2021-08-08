const itemsController = {};
const Items = require('../models/items.model');
const moment = require('moment');  
itemsController.addItem = async (req, res) => {
    try {
      const body = req.body;
      const item = new Items(body);
      item.timeStamp = moment().format('LLL');
      const result = await item.save();
  
      res.send({
        message: 'item added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This item has already been added',
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

  itemsController.getAll = async (req, res) => {
    let items;
    try {
      let merged = {};
      const start = 0;
      const length = 100;
  
      items = await Items.paginate(
        merged,
        {
          offset: parseInt(start),
          limit: parseInt(length)
        }
      );
      console.log('result', items);
      res.status(200).send({
        code: 200,
        message: 'Successful',
        data: items
  
      });
    } catch (error) {
      console.log('error', error);
      return res.status(500).send(error);
    }
  };
  module.exports = itemsController;
