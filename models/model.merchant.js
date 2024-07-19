const mongoose = require('mongoose');

const MerchantSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is REQUIRED"],
        },
        number: {
            type: String,
            required: [true, "Mobile Number is REQUIRED"],
        },
        nickname: {
            type: String,
            required: [true, "Nickname is REQUIRED"],
        }
    },
    { 
        timestamps: true
    }
);

const Merchant = mongoose.model("Merchant", MerchantSchema)

module.exports = Merchant