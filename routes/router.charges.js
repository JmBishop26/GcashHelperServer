const express = require('express');
const Charges = require('../models/model.charges');
const router = express.Router();

router.get(
    '/',
    async(request, response) => {
        try {
            const charges = await Charges.find()

            response.status(200).json({code: "SUC20000", message: "Fetched Successfully!", data: charges})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
    }
)

module.exports = router