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


//transactions
app.get(
    '/api/transactions/all',
    async (request, response) => {
        try {
            const transactions = await Transaction.find()
            response.status(200).json(transactions)
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

app.get(
    '/api/transactions/:id',
    async (request, response) => {
        try {
            const { id } = request.params
            const transaction = await Transaction.findById(id)
            response.status(200).json(transaction)
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

app.post(
    '/api/transactions/create', 
    async (request, response) => {
        try {
            const transaction = await Transaction.create(request.body)
            response.status(200).json(transaction)
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

app.put(
    '/api/transactions/update/:id',
    async (request, response) => {
        try {
            const { id } = request.params
            const transaction = await Transaction.findByIdAndUpdate(id, request.body)
            
            if(!transaction){
                return response.status(404).json({code: "ERR40004", message: "Transaction not found!", data: null})
            }
            const updatedTransaction = await Transaction.findById(id)
            response.status(200).json({code: "SUC20000", message: "Updated Successfully", data: updatedTransaction})

        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

//merchants
app.get(
    '/api/merchants/all',
    async (request, response) => {
        try {
            const merchants = await Merchant.find()
            response.status(200).json({code: "SUC20000", message: "Fetched Successfully!", data: merchants})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

app.post(
    '/api/merchants/create',
    async (request, response) => {
        try {
            const data = processData(request.body)

            const merchant = await Merchant.create(data)
            console.log(merchant)
            response.status(200).json(merchant)
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

app.listen(process.env.PORT, ()=>{
    console.log(`running on port ${process.env.PORT}`)
})