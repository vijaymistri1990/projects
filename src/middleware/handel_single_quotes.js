const common = require('common-utils');

const handle_single_quotes = (req, res, next) => {
    let reqData = (common.isRealValue(req.body)) ? req.body : req.query;
    let filter_obj = {};
    let reqdata_keys = Object.keys(reqData);
    console.log(reqdata_keys)
    let reqdata_keys_length = reqdata_keys.length;
    for (let reqdata_key = 0; reqdata_key < reqdata_keys_length; reqdata_key++) {
        let element = reqdata_keys[reqdata_key];
        /**
         * GD0100
         * to skip json formate of module data and module ids for user permission module
         */
        if (typeof reqData[element] === 'object' && reqData[element] != null) {
            let is_array = reqData[element].length;
            if (is_array) {
                let received_array = reqData[element];
                let item_array = [];
                let received_array_length = received_array.length;
                for (let array_key = 0; array_key < received_array_length; array_key++) {
                    let array_item = received_array[array_key];
                    if (typeof array_item === 'object') {
                        let child_obj_key = Object.keys(array_item);
                        let child_obj_value = Object.values(array_item);
                        let child_obj = {};
                        for (let key = 0; key < child_obj_key.length; key++) {
                            if (typeof child_obj_value[key] === 'string') {
                                child_obj[child_obj_key[key]] = (child_obj_value[key]).replace(/'/g, "''");
                            } else {
                                child_obj[child_obj_key[key]] = child_obj_value[key];
                            }
                        }
                        item_array.push(child_obj);
                        filter_obj[element] = item_array;
                    } else {
                        item_array.push(array_item);
                        filter_obj[element] = item_array;
                    }
                }
            } else {
                let child_obj_key = Object.keys(reqData[element]);
                let child_obj_value = Object.values(reqData[element]);
                let child_obj = {};
                for (let key = 0; key < child_obj_key.length; key++) {
                    if (typeof child_obj_value[key] === 'string') {
                        child_obj[child_obj_key[key]] = (child_obj_value[key]).replace(/'/g, "''");
                    } else {
                        child_obj[child_obj_key[key]] = child_obj_value[key];
                    }
                }
                filter_obj[element] = (child_obj);
            }
        } else if (typeof reqData[element] === 'string') {
            filter_obj[element] = (reqData[element]).replace(/'/g, "''");
        } else {
            filter_obj[element] = reqData[element];
        }
    }
    (common.isRealValue(req.body)) ? req.body = filter_obj : req.query = filter_obj;
    next();
};
module.exports = handle_single_quotes;
