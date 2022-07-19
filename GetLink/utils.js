const matchResponse = (arr, responseUrl) => {
    const flag = arr.find(ele => {
        if (responseUrl.includes(ele)) {
            return true;
        }
    });
    if (flag) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = {
    matchResponse
}
