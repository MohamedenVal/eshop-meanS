const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

// midleware 
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
// app.use(errorHandler);


// Routes for different api endpoints
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/catagories');
const ordersRouter = require('./routers/orders');
const usersRouter = require('./routers/users');


const api = process.env.API_URL;

// routers 
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);



// connecting to the mangoDB server
/**
 * {
 * useNewUrlParser: true,
 * useUnifiedTopology: true,
 * dbName: 'eshop-database'
 * })
 * this added piece of code I don't uderstand 
 * so I removed it since it doesn't effect the script
 *
 */
mongoose.connect(process.env.CONNECTION_STRING)
.then( () => {
    console.log('connection is ready!');    
})
.catch((err) => {
    console.log(err);
});

app.listen(3000, () => {
    console.log(process.env.CONNECTION_STRING);
    console.log('server running on http://localhost:3000');
});