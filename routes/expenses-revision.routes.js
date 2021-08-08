const express = require("express");
const router = express.Router();

const expRevisionController = require('../controllers/expenses-revision.controllers');
//const checkAuth = require('../middleware/check-auth');

router.post("/add",expRevisionController.addExpense);

module.exports = router;