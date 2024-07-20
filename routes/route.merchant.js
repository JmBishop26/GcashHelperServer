const express = require('express');
const Merchant = require('../models/model.merchant');
const { nicknameToUpper } = require('../helper/utils');

const router = express.Router();

router.post(
    '/create', 
    async (request, response) => {
        try {
            const data = nicknameToUpper(request.body)

            const merchant = await Merchant.create(data)
            response.status(200).json({code: "SUC20000", message: "Created Successfully!", data: merchant})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
});

router.get(
    '/all', 
    async (request, response) => {
        try {
            const merchants = await Merchant.find()
            response.status(200).json({code: "SUC20000", message: "Fetched Successfully!", data: merchants})
        } catch (error) {
            response.status(500).json({code: "ERR50000", message: error.message, data: null})
        }
});

module.exports = router;