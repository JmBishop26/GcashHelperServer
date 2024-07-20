
function nicknameToUpper(data) {
    var cloneData = { ...data }

    if(cloneData.nickname){
        cloneData.nickname = cloneData.nickname.toUpperCase() 
    }
    return cloneData
}

function processTransaction(data){
    var subTotal  = 0;
    var charge  = 0;
    var grandTotal = 0;

    data.forEach(element => {
        subTotal += parseFloat(element.amount.toFixed(2))
        charge += parseFloat(element.charge.toFixed(2))
    });
    
    grandTotal = parseFloat((subTotal + charge).toFixed(2))


    return { subTotal: subTotal, charge: charge, grandTotal: grandTotal }
}

module.exports = { nicknameToUpper, processTransaction }