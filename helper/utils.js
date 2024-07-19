
function processData(data) {
    var cloneData = { ...data }

    if(cloneData.nickname){
        cloneData.nickname = cloneData.nickname.toUpperCase() 
    }
    return cloneData
}

module.exports = { processData }