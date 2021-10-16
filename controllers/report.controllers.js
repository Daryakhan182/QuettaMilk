const ReportController = {};
const itemReport = require('../models/itemReport.model');
const Purchases = require('../models/purchases.model');
const Items = require('../models/items.model');
const Sales = require('../models/sales.model');
const Payments = require('../models/payments.model');
const Expenses = require('../models/expenses.model');

const path = require('path');
const moment = require('moment');
var querystring = require('querystring');
const http = require('http');
ReportController.getItemReport = async (req, res) => {
  console.log('in item report')
  let purchasedItems = await Items.aggregate([
    { $project: { itemId: { $toString: "$_id" }, Itemname: 1 } }, {
      $lookup:
      {
        from: "purchases",
        localField: "itemId",
        foreignField: "item",
        as: "order_fact_docs"
      }
    },

    { $unwind: '$order_fact_docs' },

    { $group: { _id: "$_id", name: { $last: '$Itemname' }, purchasedQuantity: { $sum: '$order_fact_docs.quantity' } } },
  ])
  let soldItems = await Items.aggregate([
    { $project: { itemId: { $toString: "$_id" }, Itemname: 1 } }, {
      $lookup:
      {
        from: "sales",
        localField: "itemId",
        foreignField: "item",
        as: "sales_docs"
      }
    },

    { $unwind: '$sales_docs' },

    { $group: { _id: "$_id", soldQuantity: { $sum: '$sales_docs.quantity' } } },
  ]);
  let wastageItems = await Items.aggregate([
    { $project: { itemId: { $toString: "$_id" }, Itemname: 1 } }, {
      $lookup:
      {
        from: "waistages",
        localField: "itemId",
        foreignField: "item",
        as: "waistages_docs"
      }
    },

    { $unwind: '$waistages_docs' },

    { $group: { _id: "$_id", wastageQuantity: { $sum: '$waistages_docs.quantity' } } },
  ])
  //console.log('ids = ', a)
  // console.log('wastageItems', wastageItems)

  const mergeById = (a1, a2) =>
    a1.map(itm => ({
      ...a2.find((item) => (item.id === itm.id) && item),
      ...itm
    }));
  let arr1 = mergeById(soldItems, purchasedItems);

  // const result = soldItems.map(v => ({ ...v, ...purchasedItems.find(sp => sp.id === v.id) }));
  //  const mergedArray = [...soldItems, ...purchasedItems,...wastageItems];
  //  var output = [];
  //  var resutl = mergedArray
  //  .groupBy('id')
  //  .map(_.spread(_.assign))
  //  .value();
  // const newData = purchasedItems.map((item, row) => {
  //   const found = soldItems.find((element) => item._id == element._id);
  //   return { ...item, ...found };
  // });
  //  console.log('purchasedItems', newData)

  // console.log('arr1',arr1);
  //console.log('purchases included',mergeById(arr1, purchasedItems));
  const result = purchasedItems.map(v => ({ ...v, ...soldItems.find(sp => sp.id === v.id) }));

  res.status(200).send({
    code: 200,
    message: 'Successful',
    purchase: arr1
  });

};
ReportController.getISaleReport = async (req, res) => {
  console.log('in item report')
  let day = req.body.day;
  let month = req.body.month;
  let year = req.body.year;
  var d;
  console.log(req.body);

  let paid = await Sales.aggregate([
    { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
    {
      $project:
      {
        year: { $year: "$dateObj" },
        month: { $month: "$dateObj" },
        day: { $dayOfMonth: "$dateObj" },
        status: 1,
        camp_id: 1,
        item: 1, quantity: 1, payment: 1, amount: 1
      }
    },
    {
      $match:
      {
        $and: [
          { year: year },
          { month: month },
          { day: day },
          { payment: "true" }
        ]
      }
    },
    { $group: { _id: "$day", paid: { $sum: '$amount' } } },
  ])
  let unpaid = await Sales.aggregate([
    { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
    {
      $project:
      {
        year: { $year: "$dateObj" },
        month: { $month: "$dateObj" },
        day: { $dayOfMonth: "$dateObj" },
        status: 1,
        camp_id: 1,
        item: 1, quantity: 1, payment: 1, amount: 1
      }
    },
    {
      $match:
      {
        $and: [
          { year: year },
          { month: month },
          { day: day },
          { payment: "false" }
        ]
      }
    },
    { $group: { _id: "$day", unpaid: { $sum: '$amount' } } },
  ])
  let saleList = await Sales.aggregate([
    {
      $project: {
        dateObj: { $toDate: "$timeStamp" }, itemId: { $toObjectId: "$item" }, buyerId: { $toObjectId: "$buyer" }, userId: { $toObjectId: "$userId" }, quantity: 1,
        unitPrice: 1,
        amount: 1,
        timeStamp: 1, payment: 1
      }
    },
    {
      $project:
      {
        year: { $year: "$dateObj" },
        month: { $month: "$dateObj" },
        day: { $dayOfMonth: "$dateObj" },
        itemId: 1,
        buyerId: 1,
        userId: 1,
        quantity: 1,
        unitPrice: 1,
        amount: 1,
        timeStamp: 1
        , payment: 1
      }
    },
    {
      $match:
      {
        $and: [
          { year: year },
          { month: month },
          { day: day }
        ]
      }
    },
    {
      $lookup:
      {
        from: "items",
        localField: "itemId",
        foreignField: "_id",
        as: "itemObj"
      }
    },

    { $unwind: '$itemObj' },
    {
      $lookup:
      {
        from: "buyers",
        localField: "buyerId",
        foreignField: "_id",
        as: "buyerObj"
      }
    },

    { $unwind: '$buyerObj' },
    {
      $lookup:
      {
        from: "managers",
        localField: "userId",
        foreignField: "_id",
        as: "userObj"
      }
    },

    { $unwind: '$userObj' }

  ])

  res.status(200).send({
    code: 200,
    message: 'Successful',
    unpaid: unpaid,
    paid: paid,
    saleList: saleList
  });

};
ReportController.getISaleReportRange = async (req, res) => {
  console.log('in item report')
  let paid;
  let unpaid;
  let oldUnpaidAmount;
  let totalUnpaid;
  let paidFromPayments;
  let totalPaidFromPayments;
  let expensesAmount;
  var d;
  if (req.body.menu == 'Date Range') {
    var fromDate = req.body.start.split('T')[0];
    var toDate = req.body.end.split('T')[0];
    // console.log('startDate',startDate);
    // console.log('endDate',endDate);
    // var fromDate = '2021-09-18';
    // var toDate = '2021-09-22';
    paid = await Sales.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, amount: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $gte: fromDate, $lte: toDate } },
            { payment: "true" }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    ])
    expensesAmount = await Expenses.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, price: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, price: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $gte: fromDate, $lte: toDate } }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$price' } } },
    ])
    unpaid = await Sales.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, amount: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $gte: fromDate, $lte: toDate } },
            { payment: "false" }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    ])
    oldUnpaidAmount = await Sales.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, amount: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $lt: fromDate } },
            { payment: "false" }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    ])
    totalUnpaid = await Sales.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, amount: 1
        }
      },
      {
        $match:
        {
          $and: [

            { payment: "false" }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    ])
    paidFromPayments = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          amount: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $gte: fromDate, $lte: toDate } }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    ])
  } else if (req.body.menu == 'Date') {
    let date = req.body.date;
    paid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1,unpaid:1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: date },
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    expensesAmount = await Expenses.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, price: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, price: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: date }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$price' } } },
    ])
    
    // unpaid = await Sales.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1 } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       status: 1,
    //       camp_id: 1,
    //       item: 1, quantity: 1, payment: 1, amount: 1
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { dateObj: date },
    //         { payment: "false" }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])
    oldUnpaidAmount = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" },unpaid:1, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $lt: date } }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } , unpaid: { $sum: '$unpaid' } } },
    ])
    totalUnpaid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, unpaid:1, amount: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' } , unpaid: { $sum: '$unpaid' }} },
    ])
    // paidFromPayments = await Payments.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1 } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       amount: 1
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { dateObj: date }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])
  
  } else if (req.body.menu == 'Buyer') {
    let buyerId = req.body.buyer;
    paid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, unpaid:1, amount: 1, buyer: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1, buyer: 1
        }
      },
      {
        $match:
        {
          $and: [
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    // totalUnpaid = oldUnpaidAmount = unpaid = await Sales.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1, buyer: 1 } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       status: 1,
    //       camp_id: 1,
    //       item: 1, quantity: 1, payment: 1, amount: 1, buyer: 1
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { buyer: buyerId },
    //         { payment: "false" }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])


  //   paidFromPayments = await Payments.aggregate([
  //     { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1 , buyer: 1} },
  //     {
  //       $project:
  //       {
  //         amount: 1, buyer: 1
  //       }
  //     },
  //     {
  //       $match:
  //       {
  //         $and: [
  //           { buyer: buyerId }
  //         ]
  //       }
  //     },
  //  { $group: { _id: "$day", paid: { $sum: '$amount' } } },
  //   ])

  } else if (req.body.menu == 'Date And Buyer') {
    let date = req.body.date;
    let buyerId = req.body.buyer;
    paid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, unpaid:1, amount: 1,buyer:1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1,buyer:1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: date },
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    expensesAmount = await Expenses.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, price: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, price: 1
        }
      },
      {
        $match:
        {
          $and: [ { dateObj: date }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$price' } } },
    ])
    // unpaid = await Payments.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1,buyer:1  } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       status: 1,
    //       camp_id: 1,
    //       item: 1, quantity: 1, payment: 1, amount: 1,buyer:1 
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { dateObj: date },
    //         { buyer: buyerId },
    //         { payment: "false" }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])
    oldUnpaidAmount = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" },unpaid:1, amount: 1,buyer:1  } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1,buyer:1 
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $lt: date } },
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    totalUnpaid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" },unpaid:1, amount: 1,buyer:1  } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1,buyer:1 
        }
      },
      {
        $match:
        {
          $and: [
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    // paidFromPayments = await Payments.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1,buyer:1  } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       amount: 1,buyer:1
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { buyer: buyerId },
    //         { dateObj: date }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])
  } else if (req.body.menu == 'Date Range And Buyer') {
    var fromDate = req.body.start.split('T')[0];
    var toDate = req.body.end.split('T')[0];
    let buyerId = req.body.buyer;
    paid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, unpaid:1, amount: 1,buyer:1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1,buyer:1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $gte: fromDate, $lte: toDate } },
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    expensesAmount = await Expenses.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, price: 1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          status: 1,
          camp_id: 1,
          item: 1, quantity: 1, payment: 1, price: 1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $gte: fromDate, $lte: toDate } }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$price' } } },
    ])
    // unpaid = await Payments.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1, quantity: 1, payment: 1, amount: 1,buyer:1 } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       status: 1,
    //       camp_id: 1,
    //       item: 1, quantity: 1, payment: 1, amount: 1,buyer:1
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { dateObj: { $gte: fromDate, $lte: toDate } },
    //         { buyer: buyerId },
    //         { payment: "false" }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])
    oldUnpaidAmount = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" },unpaid:1, amount: 1,buyer:1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1,buyer:1
        }
      },
      {
        $match:
        {
          $and: [
            { dateObj: { $lt: fromDate } },
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    totalUnpaid = await Payments.aggregate([
      { $project: { dateObj: { $toDate: "$timeStamp" }, unpaid:1, amount: 1,buyer:1 } },
      {
        $project:
        {
          dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
          unpaid:1, amount: 1,buyer:1
        }
      },
      {
        $match:
        {
          $and: [
            { buyer: buyerId }
          ]
        }
      },
      { $group: { _id: "$day", paid: { $sum: '$amount' }, unpaid: { $sum: '$unpaid' } } },
    ])
    // paidFromPayments = await Payments.aggregate([
    //   { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1,buyer:1 } },
    //   {
    //     $project:
    //     {
    //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
    //       amount: 1,buyer:1
    //     }
    //   },
    //   {
    //     $match:
    //     {
    //       $and: [
    //         { buyer: buyerId },
    //         { dateObj: { $gte: fromDate, $lte: toDate } }
    //       ]
    //     }
    //   },
    //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
    // ])
  }
  // totalPaidFromPayments = await Payments.aggregate([
  //   { $project: { dateObj: { $toDate: "$timeStamp" }, amount: 1 } },
  //   {
  //     $project:
  //     {
  //       dateObj: { '$dateToString': { format: '%Y-%m-%d', date: '$dateObj' } },
  //       amount: 1
  //     }
  //   },
  //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
  // ])
 // console.log(req.body);

 
  // console.log('paid',paid[0].paid);
  // console.log('paid',paid[0].unpaid);
  // console.log('totalpaid',totalUnpaid[0].paid);
  // console.log('totalunpaid',totalUnpaid[0].paid-totalUnpaid[0].unpaid);

  // console.log('oldpaidAmount',oldUnpaidAmount[0].paid);
  // console.log('oldUnpaidAmount',oldUnpaidAmount[0].paid-oldUnpaidAmount[0].unpaid);

  // let unpaid = await Sales.aggregate([
  //   { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1,quantity:1,payment:1,amount:1 } },
  //   {
  //     $project:
  //       {
  //         year: { $year: "$dateObj" },
  //         month: { $month: "$dateObj" },
  //         day: { $dayOfMonth: "$dateObj" },
  //         status: 1,
  //         camp_id: 1,
  //         item: 1,quantity:1,payment:1 ,amount:1
  //       }
  //   },
  //   {
  //     $match:
  //       {
  //         $and: [ 
  //         {year:  year },
  //         {month:  month} ,
  //         {day:  day} ,
  //         {payment:"false"}
  //         ]
  //       }
  //   },
  //   { $group: { _id: "$day", unpaid: { $sum: '$amount' } } },
  // ])
  // let saleList = await Sales.aggregate([
  //   { $project: { dateObj: { $toDate: "$timeStamp" },itemId: { $toObjectId: "$item" },buyerId: { $toObjectId: "$buyer" },userId: { $toObjectId: "$userId" },quantity:1,
  //   unitPrice:1,
  //   amount:1,
  //   timeStamp:1,payment:1 } }, 
  //   {
  //     $project:
  //       {
  //         year: { $year: "$dateObj" },
  //         month: { $month: "$dateObj" },
  //         day: { $dayOfMonth: "$dateObj" },
  //         itemId: 1,
  //         buyerId: 1,
  //         userId:1,
  //         quantity:1,
  //         unitPrice:1,
  //         amount:1,
  //         timeStamp:1
  //         ,payment:1
  //       }
  //   },
  //   {
  //     $match:
  //       {
  //     {$gte:  11
  //       }
  //   },
  //   {
  //     $lookup:
  //     {
  //       from: "items",
  //       localField: "itemId",
  //       foreignField: "_id",
  //       as: "itemObj"
  //     }
  //   },

  //   { $unwind: '$itemObj' },
  //   {
  //     $lookup:
  //     {
  //       from: "buyers",
  //       localField: "buyerId",
  //       foreignField: "_id",
  //       as: "buyerObj"
  //     }
  //   },

  //   { $unwind: '$buyerObj' },
  //   {
  //     $lookup:
  //     {
  //       from: "managers",
  //       localField: "userId",
  //       foreignField: "_id",
  //       as: "userObj"
  //     }
  //   },

  //   { $unwind: '$userObj' }

  // ])

  res.status(200).send({
    code: 200,
    message: 'Successful',
    unpaid: unpaid,
    paid: paid,
    oldUnpaidAmount: oldUnpaidAmount,
    totalUnpaid: totalUnpaid,
    paidFromPayments: paidFromPayments,
    totalPaidFromPayments:totalPaidFromPayments,
    expensesAmount:expensesAmount
    //saleList:saleList
  });

};




module.exports = ReportController;

/////////////////////////////////////////////////////////////////////////////////////////////////////
