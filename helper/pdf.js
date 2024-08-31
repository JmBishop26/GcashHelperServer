const { jsPDF } = require("jspdf");

function createHeaders(keys) {
    var result = [];
    for (var i = 0; i < keys.length; i += 1) {
        result.push({
        id: keys[i],
        name: keys[i],
        prompt: keys[i],
        });
    }
    return result;
}

function toMoneyFormat(amount){
    var peso = "₱"
    return `${amount.toFixed(2)}`
}
function formatDate(dateString) {
    let date = new Date(dateString);
    
    let options = { year: 'numeric', month: 'long', day: 'numeric' };

    return date.toLocaleDateString('en-US', options);
}
  
function buildHeading(doc, data){
    const { date, transactions, merchant, subTotal, charges, grandTotal } = data

    createTextWithLabel(doc, "Merchant: ", merchant.nickname, 5)
    createTextWithLabel(doc, "Date: ", formatDate(date), 10)
    createTextWithLabel(doc, "Sub Total: ", toMoneyFormat(subTotal), 20)
    createTextWithLabel(doc, "Charges: ", toMoneyFormat(charges), 30)
    createTextWithLabel(doc, "Grand Total: ", toMoneyFormat(grandTotal), 40)
}

function createTextWithLabel(doc, label, text, yPosition){
    doc.setFontSize(12);
    // const doc = new jsPDF();
    doc.setFont("helvetica", "normal")
    doc.text(label, 0.3, yPosition)
    doc.setFont("helvetica", "bold")
    var textLength = doc.getTextWidth(label)
    doc.text(text, textLength + 0.3, yPosition)
    doc.setFont("helvetica", "normal")
}


function generatePdf(){


}

// //format

module.exports = { createHeaders, buildHeading, toMoneyFormat, formatDate }