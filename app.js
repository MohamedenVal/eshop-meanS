const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const cors = require('cors')
require('dotenv/config');

app.use(cors());
app.options('*', cors())

// midleware 
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler);



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
 * CONNECTION_STRING
 */
mongoose.connect(process.env.local_CONN)
.then( () => {
    console.log('connection is ready!');    
})
.catch((err) => {
    console.log(err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('server running on http://localhost:3000');
});