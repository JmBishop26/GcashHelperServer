
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

module.exports = { nicknameToUpper, processTransaction }