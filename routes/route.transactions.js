const express = require('express');
const Transaction = require('../models/model.transaction');

const router = express.Router();

router.get(
    '/all/:merchantID',
    async (request, response) => {
        try {
            const { merchantID } = request.params
            const transactions = await Transaction.find({merchantID : merchantID})
            response.status(200).json({code: "SUC20000", message: "Fetched Successfully!", data: transactions})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

router.get(
    '/:id',
    async (request, response) => {
        try {
            const { id } = request.params
            const transaction = await Transaction.findById(id)
            response.status(200).json({code: "SUC20000", message: "Fetched Successfully!", data: transaction})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

router.post(
    '/create', 
    async (request, response) => {
        try {
            const transaction = await Transaction.create(request.body)
            response.status(200).json({code: "SUC20000", message: "Created Successfully!", data: transaction})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

router.put(
    '/update/:id',
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

module.exports = router;