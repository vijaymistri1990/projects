"use strict";
import jwt from "jsonwebtoken";
import config from '../config/config.js';
import { handleError } from '../helper/response_handler.js';
const verifyToken = (req, res, next) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    if (req.method !== "OPTIONS") {
        let token = req.headers.authentication;
        if (token) {
            token = Buffer.from(token, 'base64').toString('utf8');
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    handleError(statusCode.UNAUTHORIZED, en.ERROR_NOT_VALID_TOKEN, res);
                } else {
                    if (decoded) {
                        res.locals.user_id = parseInt(decoded?.id);
                        res.locals.user_name = decoded?.user_name;
                        next();
                    } else {
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    }
                }
            });
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_NO_FOUND_TOKEN, res);
        }
    } else {
        next();
    }
};
export default verifyToken;