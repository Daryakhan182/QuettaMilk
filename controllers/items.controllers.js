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
        message: 'item added successfully',
        data: result
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
itemsController.deleteItem = async (req, res) => {
  if (!req.params._id) {
    Fu;
    res.status(500).send({
      message: 'ID missing'
    });
  }
  try {
    const _id = req.params._id;

    const result = await Items.findOneAndDelete({
      _id: _id
    });
    res.status(200).send({
      code: 200,
      message: 'Deleted Successfully'
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};
itemsController.updateItem = async (req, res) => {
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
    const result = await Items.updateOne(
      {
        _id: _id
      },
      {
        $set: updates
      },
      {
        upsert: true,
        runValidators: true,
      }
    );
    {
      if (result.nModified == 1) {
        const updated = await Items.findOne({ _id: _id });
        res.status(200).send({
          code: 200,
          message: 'Updated Successfully',
          data: updated
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

  itemsController.getAll = async (req, res) => {
    console.log('body',req.body);
    let obj = req.body;
    if(obj.Itemname || obj.countingUnit || obj.price)
    {
      let searhItem;
      try {
        const name = obj.Itemname;
        const count = obj.countingUnit;
        const price = obj.price;
        let query;
        //making query for mongodb to excute.
        if(name && count && price)
        {
          searhItem = await Items.find({ Itemname: name, countingUnit:count, price:price });
          console.log('query:',searhItem);

        }
        else if (name && count)
        {
          searhItem = await Items.find({ Itemname: name, countingUnit:count});
          console.log('query:',searhItem);
        }
        else if (name && price)
        {
          searhItem = await Items.find({ Itemname: name, price:price });
          console.log('query:',searhItem);
        }
        else if (price && count)
        {
          searhItem = await Items.find({ countingUnit:count, price:price });
          console.log('query:',searhItem);
        }
        else if (name)
        {
          searhItem = await Items.find({ Itemname: name});
          console.log('query:',searhItem);
        }
        else if (price)
        {
          searhItem = await Items.find({ price : { $type : 1} } );
          // db.addressBook.find( { price : { $type : 1 } } )


          console.log('query:',searhItem);
        }
        else if (count)
        {
          searhItem = await Items.find({ countingUnit:count});
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
        console.log('items:',items.docs);
        res.status(200).send({
          code: 200,
          message: 'Successful',
          data: items.docs
    
        });
      } catch (error) {
        console.log('error', error);
        return res.status(500).send(error);
      }
    }

  };
  module.exports = itemsController;
