const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path= require('path');

const errorHandler = require("./middleware/error-handler");
const errorMessage = require("./middleware/error-message");
const accessControls = require("./middleware/access-controls");
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser')
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  
  
  app.use(bodyParser.json()); // to support JSON-encoded bodies
  
// Requiring Routes

const UsersRoutes = require('./routes/users.routes');
const AdminsRoutes = require('./routes/admins.routes');
const BuyersRoutes = require('./routes/buyers.routes');
const SellersRoutes = require('./routes/sellers.routes');
const StocksRoutes = require('./routes/stocks.routes');
const ExpensesRoutes = require('./routes/expenses.routes');
const WaistageRoutes = require('./routes/waistage.routes');






// connection to mongoose
require('dotenv').config();
const mongoCon = process.env.mongoCon;
// console.log("MongoDB",mongoCon)

mongoose.connect(mongoCon,{ useNewUrlParser: true,useCreateIndex: true, useUnifiedTopology: true });


const fs = require('fs');
fs.readdirSync(__dirname + "/models").forEach(function(file) {
    require(__dirname + "/models/" + file);
});


app.get('/',  function (req, res) {
  res.status(200).send({
    message: 'Express backend server'});
});

app.set('port', (3000));

app.use(accessControls);
app.use(cors());

// Routes which should handle requests
app.use("/users",UsersRoutes);
app.use("/admins",AdminsRoutes);
app.use("/buyers",BuyersRoutes);
app.use("/sellers",SellersRoutes);
app.use("/stocks",StocksRoutes);
app.use("/expenses",ExpensesRoutes);
app.use("/waistages",WaistageRoutes);




app.use(errorHandler);

app.use(errorMessage);

server.listen(app.get('port'));
console.log('listening on port',app.get('port'));

module.exports = server;