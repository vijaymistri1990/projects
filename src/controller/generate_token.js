"use strict";
const jwt = require("jsonwebtoken");
const common = require("common-utils");
const { db } = require('../helper');
const { createLogDb } = require('../helper/log_function');
const config = require('../config/config');
const { handleError, handleSuccess } = require('../helper/response_handler');

const create = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    try {
        const reqData = req.body;
        if (reqData?.shop) {
            const shop = reqData.shop;
            const store_client_id = (await db.selectedRows(config.TABLE_CLIENT_STORES, 'store_client_id', `store_name = '${shop}'`))?.store_client_id;
            if (common.checkValues(store_client_id)) {
                const storedata = { store_name: shop, store_client_id: store_client_id };
                db.getStoreData(shop).then((shopInfo) => {
                    if (common.isRealValue(shopInfo)) {
                        jwt.sign(storedata, config.secret, { expiresIn: 1440 * 60 }, (err, security_token) => {
                            if (err) {
                                throw err;
                            } else {
                                shopInfo.token = (shopInfo?.token) ? db.getEncryptDecryptData(config.ACTION_ENCRYPT, shopInfo.token) : "";
                                shopInfo.scid = (shopInfo?.store_client_id) ? db.getEncryptDecryptData(config.ACTION_ENCRYPT, (shopInfo.store_client_id).toString()) : "";
                                shopInfo.money_format = common.html_entity_decode(shopInfo.money_format);
                                res.setHeader("security_token", Buffer.from(security_token).toString('base64'));
                                let data = {
                                    shop_data: shopInfo,
                                    token: Buffer.from(security_token).toString('base64')
                                };
                                handleSuccess(statusCode.OK, en.SUCCESS_TOKEN_GENERATE, data, res);
                            }
                        }); /* 24 hours */
                    } else {
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    }
                }).catch((error) => {
                    console.log("shopInfo=================error==============>", error)
                    const log_string = `error at generate token-----------\n error_message=${error.message}--------\n error_status=${error.code}------------------------\nerror_stack=${error.stack}`;
                    createLogDb('error_generate_token', {
                        "type": "0",
                        "log": log_string
                    });
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                })
            } else {
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error========generate_token===========>", error)
        createLogDb("error_generate_Token", error);
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}
module.exports = { create }
