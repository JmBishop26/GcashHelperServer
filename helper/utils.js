const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { jsPDF } = require("jspdf");
const jsPDFInvoiceTemplate = require('jspdf-invoice-template-nodejs');

const { Transaction } = require('../models/model.transaction');
const { buildHeading, createTable, createHeaders, toMoneyFormat, formatDate } = require('./pdf');

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

async function generatePdf(data){

    const { date, transactions, merchant, subTotal, charges, grandTotal } = data

    const doc = new jsPDF({
        orientation: "portrait",
      });
    
    buildHeading(doc, data)

    var header = createHeaders([
        "name",
        "transaction",
        "amount",
        "charge",
    ])

    var generateData = function(amount) {
        var result = [];
        var data = {
          name: "100",
          transaction: "GameGroup",
          amount: "XPTO2",
          charge: "25",
        };
        for (var i = 0; i < amount; i += 1) {
          data.id = (i + 1).toString();
          result.push(Object.assign({}, data));
        }
        return result;
      };

    doc.table(60, 10, generateData(10), header, { autoSize: true})

    // Define a filename and path for the PDF
    const baseDir = path.resolve(__dirname, '../');
    const fileName = `transaction_report_${date}.pdf`;
    const pdfDir = path.join(baseDir, 'pdfs');
    const pdfPath = path.join(pdfDir, fileName);

    // Save the PDF to the server
    const pdfOutput = doc.output('arraybuffer');
    fs.writeFileSync(pdfPath, Buffer.from(pdfOutput));

    return fileName
}

function generateInvoice(data){
    const { date, transactions, merchant, subTotal, charges, grandTotal } = data

    const props = {
        outputType: 'save', // This will be overridden by custom handling below
        returnJsPDFDocObject: true, // Return the jsPDF object for further handling
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

    const fileName = `transaction_report_${date}.pdf`;
    const pdfDir = path.join(process.cwd(), 'api', 'tmp', 'records');
    const pdfPath = path.join(pdfDir, fileName);

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfOutput = doc.output('arraybuffer');
    fs.writeFileSync(pdfPath, Buffer.from(pdfOutput));
    
    return fileName
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


module.exports = { nicknameToUpper, processTransaction, dateFormatter, fetchData, generatePdf, createHeaders, generateInvoice }