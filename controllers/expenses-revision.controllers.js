const expRevisionController = {};
const Expenses = require('../models/expenses-revision.model');
expRevisionController.addExpense = async (req, res) => {
    try {
      const body = req.body;
      const expense = new Expenses(body);
      const result = await expense.save();
  
      res.send({
        message: 'expense revision added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This expense revision has already been registered',
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
  module.exports = expRevisionController;
