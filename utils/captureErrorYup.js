module.exports = captureErrorYup = (error) => {
    if (error.inner) {
        return error.inner.reduce((acc, currentValue) => {
            const data = { ...acc };
            data[currentValue.path] = currentValue.message;
            return data;
        }, {});
    } 
};