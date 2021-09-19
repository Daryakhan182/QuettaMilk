const ReportController = {};
const itemReport = require('../models/itemReport.model');
const Purchases = require('../models/purchases.model');
const Items = require('../models/items.model');
const Sales = require('../models/sales.model');
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
  var d ;
  console.log(req.body);

  let paid = await Sales.aggregate([
    { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1,quantity:1,payment:1,amount:1 } },
    {
      $project:
        {
          year: { $year: "$dateObj" },
          month: { $month: "$dateObj" },
          day: { $dayOfMonth: "$dateObj" },
          status: 1,
          camp_id: 1,
          item: 1,quantity:1,payment:1 ,amount:1
        }
    },
    {
      $match:
        {
          $and: [ 
          {year:  year },
          {month:  month} ,
          {day:  day} ,
          {payment:"true"}
          ]
        }
    },
    { $group: { _id: "$day", paid: { $sum: '$amount' } } },
  ])
  let unpaid = await Sales.aggregate([
    { $project: { dateObj: { $toDate: "$timeStamp" }, item: 1,quantity:1,payment:1,amount:1 } },
    {
      $project:
        {
          year: { $year: "$dateObj" },
          month: { $month: "$dateObj" },
          day: { $dayOfMonth: "$dateObj" },
          status: 1,
          camp_id: 1,
          item: 1,quantity:1,payment:1 ,amount:1
        }
    },
    {
      $match:
        {
          $and: [ 
          {year:  year },
          {month:  month} ,
          {day:  day} ,
          {payment:"false"}
          ]
        }
    },
    { $group: { _id: "$day", unpaid: { $sum: '$amount' } } },
  ])
  let saleList = await Sales.aggregate([
    { $project: { dateObj: { $toDate: "$timeStamp" },itemId: { $toObjectId: "$item" },buyerId: { $toObjectId: "$buyer" },userId: { $toObjectId: "$userId" },quantity:1,
    unitPrice:1,
    amount:1,
    timeStamp:1,payment:1 } }, 
    {
      $project:
        {
          year: { $year: "$dateObj" },
          month: { $month: "$dateObj" },
          day: { $dayOfMonth: "$dateObj" },
          itemId: 1,
          buyerId: 1,
          userId:1,
          quantity:1,
          unitPrice:1,
          amount:1,
          timeStamp:1
          ,payment:1
        }
    },
    {
      $match:
        {
          $and: [ 
          {year:  year },
          {month:  month} ,
          {day:  day} 
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
    saleList:saleList
  });

};
ReportController.getISaleReportRange = async (req, res) => {
  console.log('in item report')
  let day = req.body.day;
  let month = req.body.month;
  let year = req.body.year;
  var d ;
  console.log(req.body);

  // let paid = await Sales.aggregate([
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
  //         {payment:"true"}
  //         ]
  //       }
  //   },
  //   { $group: { _id: "$day", paid: { $sum: '$amount' } } },
  // ])
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
    // unpaid: unpaid,
    // paid: paid,
    saleList:saleList
  });

};



module.exports = ReportController;

/////////////////////////////////////////////////////////////////////////////////////////////////////
