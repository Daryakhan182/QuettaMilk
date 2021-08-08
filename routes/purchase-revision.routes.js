const express = require("express");
const router = express.Router();

const PurchasesController = require('../controllers/purchases-revision.controllers');
//const checkAuth = require('../middleware/check-auth');

router.post("/add",PurchasesController.addPurchase);



module.exports = router;