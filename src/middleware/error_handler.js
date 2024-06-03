"use strict";
const { functions } = require("../include")
function errorHandler(err, req, res, next) {
    /*if (res.headersSent) {
        return next(err);
    }*/
    console.log("err=======0000==========>", err)
    //functions.createLogDb("error_errorHandler_middleware", err);
    res.send({ "status": 500, "msg": 'Internal server error' });
}
module.exports = errorHandler;