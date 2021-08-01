const waistagesController = {};
const Waistages = require('../models/waistages.model');
waistagesController.addWaistage = async (req, res) => {
    try {
      const body = req.body;
      const waistage = new Waistages(body);
      const result = await waistage.save();
  
      res.send({
        message: 'waistage added successfully'
      });
    } catch (ex) {
      console.log('ex', ex);
      if(ex.code===11000){
        res
        .send({
          message: 'This waistage has already been registered',
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
  module.exports = waistagesController;
