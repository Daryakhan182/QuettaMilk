const salesController = {};
const Sales = require('../models/sales.model');
const path = require('path');
const moment = require('moment');
var querystring = require('querystring');
const http = require('http');

salesController.addSale = async (req, res) => {
  try {
    const body = req.body;
    const sale = new Sales(body);
    sale.timeStamp = moment().format('LLL');
    const result = await sale.save().then(item => item.populate('userId').execPopulate());
    res.send({
      message: 'sale added successfully',
      data: result
    });
  } catch (ex) {
    console.log('ex', ex);
    if (ex.code === 11000) {
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
salesController.updateSale = async (req, res) => {
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
salesController.deleteSale = async (req, res) => {
  if (!req.params._id) {
    Fu;
    res.status(500).send({
      message: 'ID missing'
    });
  }
  try {
    const _id = req.params._id;
    const result = await Sales.findOneAndDelete({
      _id: _id
    });
    if (result._id) {
      var id = result._id.toString();
      var status = 2;
      var revision = result.revision + 1;
      var revise = {
        revision: revision,
        status: status,
        groupId: id,
        userId: result.userId,
        name: result.name,
        mobileN: result.mobileN,
        address: result.address,
        phoneN: result.phoneN,
        otherN: result.otherN,
        milkPrice: result.milkPrice,
        yougurtPrice: result.yougurtPrice,
        timeStamp: moment().format('LLL')
      }
      var value = await addRevision(revise).then((responce) => {
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
async function runUpdate(_id, updates, res) {
  try {
    //save history first
    if (_id) {
      const result = await Sales.findOne({ _id: _id });
      if (result._id) {
        var id = result._id.toString();
        var status = 1;
        var revision = result.revision + 1;
        var revise = {
          revision: revision,
          status: status,
          groupId: id,
          userId: result.userId,
          name: result.name,
          mobileN: result.mobileN,
          address: result.address,
          phoneN: result.phoneN,
          otherN: result.otherN,
          milkPrice: result.milkPrice,
          yougurtPrice: result.yougurtPrice,
          timeStamp: moment().format('LLL')
        }
        // var value = await addRevision(revise).then((responce) => {
        //   return responce;
        // });
      }
    }
    const result = await Sales.updateOne(
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
        const updated = await Sales.findOne({ _id: _id }).populate('userId');
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
          message: 'Unprocessible Entity' //these values are already the same which you want to update.
        });
      }
    }
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
}
salesController.getAll = async (req, res) => {
  var result = [];
  let obj = req.body;
  let history = req.body.history;
  if (obj.name || obj.address || obj.mobileN || obj.phoneN || obj.otherN || obj.milkPrice || obj.yougurtPrice) {
    let searhItem;
    try {
      delete req.body.history;
      let queryObject = Object.keys(obj)
        .filter((k) => obj[k] != null && obj[k] != undefined && obj[k] != '')
        .reduce((a, k) => ({ ...a, [k]: obj[k] }), {});

      searhItem = await Sales.find(queryObject).populate('userId');
      console.log('searhItem:', searhItem)

      // if (history == 'true') {
      //   result = await getRevision(req.body).then((value) => {
      //     return value;
      //   });
      // }
      console.log('revidion:', result)
      let combinedArray = [];
      let latestData = [];
      latestData = searhItem;
      let historyData = [];
      historyData = result.data || [];

      combinedArray = [...latestData];
      combinedArray.push(...historyData);
      combinedArray.sort(function (a, b) {
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
    }
  }
  else {
    let items;
    try {
      items = await Sales.find({}).populate('userId');
      // if (history == 'true') {
      //   delete req.body.history;
      //   result = await getRevision(req.body).then((value) => {
      //     return value;
      //   });
      // }
      let combinedArray = [];
      let latestData = [];
      latestData = items;
      let historyData = [];
      historyData = result.data || []

      combinedArray = [...latestData];
      combinedArray.push(...historyData);
      combinedArray.sort(function (a, b) {
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
    }
  }

};
async function getRevision(revision) {
  var promise = new Promise(function (resolve, reject) {
    var postData = revision;
    var postBody = querystring.stringify(postData);
    var options = {
      host: 'localhost',
      port: 3000,
      path: '/salesRevision/all',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postBody.length
      }
    };
    var body = [];

    var req = http.request(options, function (res) {
      res.on('data', function (data) {
        body.push(data);
      });
      res.on("end", function () {
        if (body) {
          body = JSON.parse(Buffer.concat(body).toString());
          resolve(body)
        }
      });
    });
    req.write(postBody);
    req.end();

    req.on('error', function (e) {
      console.error(e);
    });
  });
  return promise
}
async function addRevision(revision) {
  var promise = new Promise(function (resolve, reject) {
    var postData = revision;
    var postBody = querystring.stringify(postData);
    var options = {
      host: 'localhost',
      port: 3000,
      path: '/salesRevision/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postBody.length
      }
    };
    var body = [];

    var req = http.request(options, function (res) {
      res.on('data', function (data) {
        body.push(data);
      });
      res.on("end", function () {
        if (body) {
          body = JSON.parse(Buffer.concat(body).toString());
          resolve(body)
        }
      });
    });
    req.write(postBody);
    req.end();

    req.on('error', function (e) {
      console.error(e);
    });
  });
  return promise
}
module.exports = salesController;
