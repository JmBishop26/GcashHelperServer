const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { jsPDF } = require("jspdf");
const jsPDFInvoiceTemplate = require('jspdf-invoice-template-nodejs');

const { Transaction } = require('../models/model.transaction');
const { buildHeading, createTable, createHeaders, toMoneyFormat, formatDate } = require('./pdf');
const { getDownloadURL, uploadBytes, ref } = require('firebase/storage');
const { storage } = require('../configs/firebase');

function nicknameToUpper(data) {
    var cloneData = { ...data }

    if(cloneData.nickname){
        cloneData.nickname = cloneData.nickname.toUpperCase() 
    }
    return cloneData
}

function processTransaction(data){
    var subTotal  = 0;
    var charges  = 0;
    var grandTotal = 0;

    data.forEach(element => {
        if(element.type === "CASH_OUT"){
            subTotal -= parseFloat(element.amount.toFixed(2))
        }else{
            subTotal += parseFloat(element.amount.toFixed(2))
        }
        charges += parseFloat(element.charge.toFixed(2))
        
    });
    
    grandTotal = parseFloat((subTotal + charges).toFixed(2))


    return { subTotal: subTotal, charges: charges, grandTotal: grandTotal }
}

function dateFormatter(value){

    const date = moment.utc(value, "YYYY-MM-DD");
    date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    return date.toISOString()
}


async function fetchData(merchantID, date){
    const transactions = await Transaction.aggregate([
        {
            $match: { 
                merchantID: merchantID,
                $expr: {
                    $eq: [
                        {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" }
                        },
                        date
                    ]
                 }
            }
        }
    ])

    return transactions
}


async function generateInvoice(data){
    const { date, transactions, merchant, subTotal, charges, grandTotal } = data

    const props = {
        outputType: 'save',
        returnJsPDFDocObject: true,
        fileName: `transaction_report_${date}.pdf`,
        orientationLandscape: false,
        compress: true,
        invoice: {
          label: ' ',
          num: `${ formatDate(date) }`,
          invDate: `Generated Date: ${formattedToday()}`,
          headerBorder: true,
          tableBodyBorder: true,
          header: [
            {
              title: '#',
              style: { width: 10, },
            },
            {
              title: 'Name',
              style: { width: 80 },
            },
            {
              title: 'Transaction',
              style: { width: 30 },
            },
            { title: 'Amount' },
            { title: 'Charge' },
          ],
          table: transactions.map((transaction, index) => [
            index + 1,
            transaction.name,
            transactionType(transaction.type),
            `Php ${ toMoneyFormat(transaction.amount) }`,
            `Php ${ toMoneyFormat(transaction.charge) }`,
          ]),
          additionalRows: [
            {
              col1: 'Grand Total:',
              col2: `Php ${ toMoneyFormat(grandTotal) }`,
              style: {
                fontSize: 12,
              },
            },
            {
              col1: 'Charges:',
              col2: `Php ${ toMoneyFormat(charges) }`,
              style: {
                fontSize: 10,
              },
            },
            {
              col1: 'Sub Total:',
              col2: `Php ${ toMoneyFormat(subTotal) }`,
              style: {
                fontSize: 10,
              },
            },
          ],
        },
        pageEnable: true,
        pageLabel: 'Page ',
      };
    
    const doc = jsPDFInvoiceTemplate.default(props).jsPDFDocObject;

    const pdfOutput = doc.output('arraybuffer')

    const pdfBuffer = Buffer.from(pdfOutput)

    const fileName = `transaction_report_${date}.pdf`
    const storageRef = ref(storage, `pdfs/${fileName}`)

    const url = upload(storageRef, pdfBuffer)

    return url
}

function transactionType(type){
    var value = ""

    switch (type) {
        case "CASH_IN":
            value = "CASH IN"
            break;
        case "CASH_OUT": 
            value = "CASH OUT"
            break;
        case "LOAD":
            value = "LOAD"
        default:
            break;
    }

    return value
}

function formattedToday(){
    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}`;
}

async function upload(storageRef, pdfBuffer){
  try {
    const uploadResult = await uploadBytes(storageRef, pdfBuffer, { contentType: 'application/pdf' })

    const downloadURL = await getDownloadURL(uploadResult.ref)
    
    return downloadURL
  } catch (error) {
    throw error
  }
}

module.exports = { nicknameToUpper, processTransaction, dateFormatter, fetchData, createHeaders, generateInvoice }