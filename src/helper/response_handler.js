function handleError(statusCode, message, res, access_expire = false, refresh_expire = false) {
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        access_expire: access_expire,
        refresh_expire: refresh_expire
    });
}

function handleSuccess(statusCode, message, data, res) {
    res.status(statusCode).json({
        status: 'success',
        statusCode,
        message,
        data
    });
}

module.exports = {
    handleError,
    handleSuccess
};
