const express = require("express");
const router = express.Router();

const itemsController = require('../controllers/items.controllers');
//const checkAuth = require('../middleware/check-auth');

// router.get("/",UserController.sampleUser);
router.get("/all",itemsController.getAll);
//router.post("/login",UserController.loginUser);
//router.post("/register",UserController.registerUser);
//router.get("/:_id",UserController.getSingleUser);
router.post("/add",itemsController.addItem);
//router.put("/:_id", UserController.updateUser);
//router.delete("/:_id", UserController.deleteUser);


module.exports = router;