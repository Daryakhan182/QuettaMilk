const itemsRevisionController = {};
const Items = require('../models/items-revision.model');
const moment = require('moment');  
itemsRevisionController.addItem = async (req, res) => {
    try {
      const body = req.body;
      const item = new Items(body);
      item.timeStamp = moment().format('LLL');
      await item.save();
      res.send({
        message: 'item revision added successfully',
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This item revision has already been added',
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

itemsRevisionController.getAll = async (req, res) => {
    let obj = req.body;
    if(obj.Itemname || obj.countingUnit || obj.price)
    {
      let searhItem;
      try {
        const name = obj.Itemname;
        const count = obj.countingUnit;
        const price = obj.price;
        if(name && count && price)
        {
          searhItem = await Items.find({ Itemname: name, countingUnit:count, price:price }).populate('userId');
          console.log('query:',searhItem);

        }
        else if (name && count)
        {
          searhItem = await Items.find({ Itemname: name, countingUnit:count}).populate('userId');
        }
        else if (name && price)
        {
          searhItem = await Items.find({ Itemname: name, price:price }).populate('userId');
          console.log('query:',searhItem);
        }
        else if (price && count)
        {
          searhItem = await Items.find({ countingUnit:count, price:price }).populate('userId');
          console.log('query:',searhItem);
        }
        else if (name)
        {
          searhItem = await Items.find({ Itemname: name}).populate('userId');
          console.log('query:',searhItem);
        }
        else if (price)
        {
          searhItem = await Items.find({ price:price } ).populate('userId');
          // db.addressBook.find( { price : { $type : 1 } } )
        }
        else if (count)
        {
          searhItem = await Items.find({ countingUnit:count}).populate('userId');
          console.log('query:',searhItem);
        }
        else 
        {
        res.status(200).send({
          code: 200,
          message: 'Unexpected Object body'
          });
        }
        res.status(200).send({
          code: 200,
          message: 'Successful',
          data: searhItem
        });
      } catch (error) {
        console.log('error', error);
        return res.status(500).send(error);
      }    }
    else
    {
      let items;
      try {

        items = await Items.find({}).populate('userId');
        res.status(200).send({
          code: 200,
          message: 'Successful',
          data: items
    
        });
      } catch (error) {
        console.log('error', error);
        return res.status(500).send(error);
      }
    }

  };
  module.exports = itemsRevisionController;
