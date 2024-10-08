const mongoose = require('mongoose');

const TransactionType = Object.freeze({
    CASH_IN: 'CASH_IN',
    CASH_OUT: 'CASH_OUT',
    LOAD: 'LOAD',
});

const TransactionSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is REQUIRED"],
        },
        number: {
            type: String,
            required: [true, "Mobile Number is REQUIRED"],
        },
        amount: {
            type: Number,
            required: [true, "Amount is REQUIRED"],
            default: 0.00
        },
        charge: {
            type: Number,
            required: false,
            default: 0.00
        },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: [true, "Transaction Type is REQUIRED"],
        },
        merchantID: {
            type: String,
            required: [true, "Merchant ID is REQUIRED"],
        }
    },
    { 
        timestamps: true
    }
);

const Transaction = mongoose.model("Transaction", TransactionSchema)

module.exports = {Transaction, TransactionType}