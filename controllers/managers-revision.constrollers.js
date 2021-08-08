const managersRevisionController = {};
const Managers = require('../models/managers-revision.model');
managersRevisionController.addManager = async (req, res) => {
    try {
      const body = req.body;
      const manager = new Managers(body);
      const result = await manager.save();
  
      res.send({
        message: 'manager revision added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This manager revision has already been registered',
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
  module.exports = managersRevisionController;
