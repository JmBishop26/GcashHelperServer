const express = require('express');
const {Transaction, TransactionType} = require('../models/model.transaction');
const moment = require('moment');
const { processTransaction } = require('../helper/utils');
const router = express.Router();

router.get(
    '/all/:merchantID',
    async (request, response) => {
        try {
            const { merchantID } = request.params
            const date = request.query.date

            const transactions = await Transaction.aggregate([
                {
                    $match: { 
                        merchantID: merchantID,
                        $expr: {
                            $eq: [
                                {
                                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                                },
                                date
                            ]
                        }
                    }
                }
            ])
            
            const {subTotal, charges, grandTotal} = processTransaction(transactions)

            response.status(200).json({code: "SUC20000", message: "Fetched Successfully!", data: { date: date, amountDetails: {subTotal: subTotal, charges: charges, grandTotal: grandTotal}, transactions: transactions}})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

router.get(
    '/all/history/:merchantID',
    async (request, response) => {
        try { 

            const { merchantID } = request.params

            const transactions = await Transaction.aggregate([
                {
                    $match: { 
                        merchantID: merchantID
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { 
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            }
                        },
                        subTotal: {
                            $sum: {
                                $cond: {
                                    if: { $or: [ { $eq: ["$type", TransactionType.CASH_IN] }, { $eq: ["$type", TransactionType.LOAD] } ] },
                                    then: "$amount",
                                    else: { $subtract: [0, "$amount"] }
                                }
                            }
                        },
                        charges: {
                            $sum : "$charge"
                        },
                        transactions: { $push: "$$ROOT" }
                    }
                },
                {
                    $project: {
                        amountDetails: {
                            subTotal: "$subTotal",
                            charges: "$charge",
                            grandTotal: { $add: ["$subTotal", "$charge"] }
                        },
                        transactions: 1
                    }
                },
                {
                    $sort: { _id: -1 }
                }
            ]);
    
            response.status(200).json({ code: "SUC20000", message: "Fetched Successfully!", data: transactions });

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