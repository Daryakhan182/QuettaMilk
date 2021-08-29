const itemsController = {};
const Items = require('../models/items.model');
const moment = require('moment');  
const http = require('http');
var querystring = require('querystring');
const { resolve } = require('path');


itemsController.addItem = async (req, res) => {
    try {
      const body = req.body;
      const item = new Items(body);
      item.timeStamp = moment().format('LLL');
      const result = await item.save().then(item => item.populate('userId').execPopulate())
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
    if(result._id)
    {
      var id  = result._id.toString();
      var status = 2;
      var revision = result.revision + 1;
      var revise =  {
      revision : revision,
      status : status,
      groupId : id,
      userId : result.userId,
      Itemname : result.Itemname,
      countingUnit : result.countingUnit,
      price : result.price,
      timeStamp : moment().format('LLL')
    }
      var value = await addRevision(revise).then((responce) =>{
        return responce;
      });
    }
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

async function addRevision(revision){
  var promise = new Promise(function(resolve, reject){
  var postData = revision;
  var postBody = querystring.stringify(postData);
  var options = {
      host: 'localhost',
      port: 3000,
      path: '/itemsRevisionRoutes/add',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postBody.length
    }
  };
  var body = [];
  
  var req =  http.request(options, function(res) {
    res.on('data', function(data) {
      body.push(data);
    });
    res.on("end", function () {
     if(body){
      body = JSON.parse(Buffer.concat(body).toString());
      resolve(body)
     }
    });
  });
  req.write(postBody);
  req.end();
  
  req.on('error', function(e) {
    console.error(e);
  });
    });
    return promise
  }

async function getRevision(revision){
var promise = new Promise(function(resolve, reject){
var postData = revision;
var postBody = querystring.stringify(postData);
var options = {
    host: 'localhost',
    port: 3000,
    path: '/itemsRevisionRoutes/all',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postBody.length
  }
};
var body = [];

var req =  http.request(options, function(res) {
  // console.log(res.statusCode);
  res.on('data', function(data) {
    body.push(data);
  });
  res.on("end", function () {
   if(body){
    body = JSON.parse(Buffer.concat(body).toString());
    resolve(body)
   }
  });
});
req.write(postBody);
req.end();

req.on('error', function(e) {
  console.error(e);
});
  });
  return promise
}
async function runUpdate(_id, updates, res) {
  try {
    //save history first
    if(_id)
    {        
      const result = await Items.findOne({ _id: _id });
      if(result._id)
      {
      var id  = result._id.toString();
      var status = 1;
      var revision = result.revision + 1;
      var revise =  {
      revision : revision,
      status : status,
      groupId : id,
      userId : result.userId,
      Itemname : result.Itemname,
      countingUnit : result.countingUnit,
      price : result.price,
      timeStamp : moment().format('LLL')
    }
      var value = await addRevision(revise).then((responce) =>{
        return responce;
      });
    }
  }
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
    var result = [];
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
          searhItem = await Items.find({ Itemname: name, countingUnit:count, price:price }).populate('userId');
          console.log('query:',searhItem);

        }
        else if (name && count)
        {
          searhItem = await Items.find({ Itemname: name, countingUnit:count}).populate('userId');
          console.log('query:',searhItem);
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
          // console.log('query price:',searhItem);
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
        if(req.body.history == 'true')
        {
          result = await getRevision(req.body).then((value)=>{
          return value;
          });
        }
        // res.status(200).send({
        //   code: 200,
        //   message: 'Successful',
        //   data: searhItem,
        //   history:result.data || []
        // });
        let combinedArray = [];
          let latestData = [];
          latestData = searhItem;
          let historyData = [];
          historyData = result.data || [];

          combinedArray = [...latestData];
          combinedArray.push(...historyData);
          combinedArray.sort(function(a, b) {
            var keyA = a._id;
              keyB = b._id;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });
        res.status(200).send({
          code: 200,
          message: 'Successful',
          data: combinedArray
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
        if(req.body.history == 'true')
        {
          result = await getRevision(req.body).then((value)=>{
          return value;
          });
        } 
        let combinedArray = [];
          let latestData = [];
          latestData = items;
          let historyData = [];
          historyData = result.data || []

          combinedArray = [...latestData];
          combinedArray.push(...historyData);
          combinedArray.sort(function(a, b) {
            var keyA = a._id;
              keyB = b._id;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });
        // res.status(200).send({
        //   code: 200,
        //   message: 'Successful',
        //   data: items.docs,
        //   history:result.data || []
        // });
        res.status(200).send({
          code: 200,
          message: 'Successful',
          data: combinedArray
        });
      } catch (error) {
        console.log('error', error);
        return res.status(500).send(error);
      }
    }

  };
  module.exports = itemsController;
