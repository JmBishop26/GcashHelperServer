const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const connectDB = require('../mongodb/connection');

const app = express();
const merchantsRoute = require('../routes/route.merchant')
const transactionsRoute = require('../routes/route.transactions');

require('dotenv').config();

app.use(bodyParser.json())

connectDB()

//transactions
app.use('/api/transactions', transactionsRoute)

//merchants
app.use('/api/merchants', merchantsRoute)


app.listen(process.env.PORT, () => {
    console.log(`running on port ${process.env.PORT}`)
})
