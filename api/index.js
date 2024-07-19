const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const connectDB = require('../mongodb/connection');
const Transaction = require('../models/model.transaction');
const Merchant = require('../models/model.merchant');
const { processData } = require('../helper/utils');
const app = express();
require('dotenv').config();

app.use(bodyParser.json())

connectDB()

app.get('/', (req, res)=> res.send('EXPRESS on VERCEL'));


app.post(
    '/api/transactions', 
    async (request, response) => {
        try {
            const transaction = await Transaction.create(request.body)
            response.status(200).json(transaction)
        } catch (error) {
            response.status(500).json({message: error.message})
        }
    }
)

app.post(
    '/api/merchants',
    async (request, response) => {
        try {
            const data = processData(request.body)

            const merchant = await Merchant.create(data)
            console.log(merchant)
            response.status(200).json(merchant)
        } catch (error) {
            response.status(500).json({message: error.message})
        }
    }
)

app.listen(process.env.PORT, ()=>{
    console.log(`running on port ${process.env.PORT}`)
})