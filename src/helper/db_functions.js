const crypto = require('crypto');
// const shopify_req = require("shopify-call")
const common = require('common-utils');
const { conn } = require('./db_connect');
const config = require('../config/config');
const { createLogDb } = require('../helper/log_function');
const fs = require('fs');

async function selectedRows(table, selected_field = "*", where = null, orderBy = null, limit = false) {
    try {
        let where_string = (where) ? getWhereCondition(where) : '';
        let sql = `SELECT ${selected_field}  FROM ${table} ${where_string}`;
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }
        if (limit) {
            sql += " LIMIT 1;";
        }
        let data_res = await query(sql);
        // console.log("data_res===========================>",data_res)
        if (data_res && data_res.length > 0) {
            return data_res[0];
        } else if (data_res && data_res.length === 0) {
            return false;
        } else {
            return data_res;
        }
    } catch (error) {
        return false;
    }
}
const deleteRetNo = (table, where) => {
    try {
        where = (where) ? getWhereCondition(where) : "";
        if (!where) {
            const error_log = common.error_log_message('0', '0', table, where, "db_functions.js", "deleteRetNo");
            createLogDb('error_common_else_checkoutpp_file', error_log);
            return false;
        }
        let query_del = `DELETE FROM ${table} ${where}`;
        queryRetNo(query_del);
        return true;
    } catch (error) {
        const error_log = common.error_log_message('0', '0', error, where, "db_functions.js", "deleteRetNo");
        createLogDb('error_common_else_checkoutpp_file', error_log);
        return false;
    }
};
function getWhereCondition(where_condition) {
    try {
        if (typeof where_condition == 'undefined' || where_condition == '') {
            where_condition = '';
        } else if (Array.isArray(where_condition) === true || typeof where_condition === 'object') {
            let where = [];
            let where_condition_key = Object.keys(where_condition);
            where_condition_key.map((key) => {
                where.push('' + key + "='" + where_condition[key] + "'");
            });
            where_condition = ' WHERE ' + where.join(' AND ');
        } else if (where_condition && typeof where_condition == 'string') {
            where_condition = ' WHERE ' + where_condition;
        }
        return where_condition;
    } catch (error) {
        return false;
    }
}
function getEncryptDecryptData(action, string) {
    try {
        let output = false;
        let encrypt_method = "aes-256-cbc";
        let secret_key = 'SIMULATOR_@%$&@*#_SECRETKEY';
        let secret_iv = 'SIMULATOR_$%&@*#^@_SECRETIV';

        let password_iv = crypto.createHash('sha256').update(secret_iv).digest('hex');
        let password_hash = crypto.createHash('sha256').update(secret_key, 'utf8').digest('hex');
        /* hash */
        let key = hex2bin(password_hash);
        /* iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warnin */
        let iv = hex2bin(password_iv)
        password_iv = Buffer.alloc(16, iv, "binary");
        password_hash = Buffer.alloc(32, key, "binary");
        if (action == 'encrypt') {
            let cipher = crypto.createCipheriv(encrypt_method, password_hash, password_iv);
            return Buffer.from(cipher.update(string, 'utf8', 'base64') + cipher.final('base64')).toString('base64');
        } else if (action == 'decrypt') {
            string = Buffer.from(string, 'base64').toString('utf8')
            let decipher = crypto.createDecipheriv('aes-256-cbc', password_hash, password_iv);
            return decipher.update(string, 'base64', 'utf8') + decipher.final('utf8')
        }
        return output;
    } catch (error) {
        return false;
    }
}

function hex2bin(hex) {
    let bytes = []; let i = 0; let len = hex.length - 1;
    for (; i < len; i += 2)
        bytes.push(parseInt(hex.substr(i, 2), 16));
    return String.fromCharCode.apply(String, bytes);
}
function queryTransaction(query, connection, value = []) {
    return new Promise((resolve) => {
        try {
            connection.query(query, value, function (errs, query_resource_obj) {
                if (errs) {
                    console.log("error=================>", errs)
                    const str = common.date_format('Y-m-d H:i:s') + "\n<br>QUERY:-" + query + "\n<br>VALUES:-" + value.toString() + "\n<br>Error:--->" + errs.stack;
                    let log_arrs = {
                        log: common.replace_str_arr(["'", "\\\\'"], ["\'", "\'"], str)
                    };
                    createLogDb('error_query_fail_query_transaction_function', log_arrs)
                    resolve(false);
                } else {
                    resolve(query_resource_obj);
                }
            })
        } catch (error) {
            let error_log = common.error_log_message('0', '0', error, query, "db_function.js", "query_transaction");
            createLogDb('common_else_error', error_log);
            resolve(false);
        }
    });
}
function query(query, value = []) {
    return new Promise((resolve) => {
        try {
            /*console.log("query=================>", query)*/
            conn.query(query, value, function (errs, query_resource_obj) {
                if (errs) {
                    console.log("error=================>", errs)
                    const str = common.date_format('Y-m-d H:i:s') + "\n<br>QUERY:-" + query + "\n<br>VALUES:-" + value.toString() + "\n<br>Error:--->" + errs.stack;
                    let log_arrs = {
                        log: common.replace_str_arr(["'", "\\\\'"], ["\'", "\'"], str)
                    };
                    createLogDb('error_query_fail_query_function', log_arrs)
                    resolve(false);
                } else {
                    resolve(query_resource_obj);
                }
            })
        } catch (error) {
            console.log("error=================>", error)
            let error_log = common.error_log_message('0', '0', error, query, "db_function.js", "query");
            createLogDb('common_else_error', error_log);
            resolve(false);
        }
    });
}
function queryRetNo(query, value = []) {
    try {
        conn.query(query, value, function (errs, query_resource_obj) {
            if (errs) {
                const str = common.date_format('Y-m-d H:i:s') + "\n<br>QUERY:-" + query + "\n<br>VALUES:-" + value.toString() + "\n<br>Error:--->" + errs.stack;
                let log_arrs = {
                    log: common.replace_str_arr(["'", "\\\\'"], ["\'", "\'"], str)
                };
                createLogDb('error_query_fail_queryRetNo_function', log_arrs)
                return false;
            } else {
                // console.log("query_resource_obj====================>", query_resource_obj)
                return query_resource_obj;
            }
        });
    } catch (error) {
        let error_log = common.error_log_message('0', '0', error, query, "db_function.js", "queryRetNo");
        createLogDb('common_else_error', error_log);
        return false;
    }
}
function insert(table, fields, is_need_data = true) {
    try {
        let keys = Object.keys(fields); let values = Object.values(fields);
        let values_length = values.length;
        let insert_key = ''; let insert_value = '';
        for (let key = 0; key < values_length; key++) {
            if (values[key] === '' || values[key] === null || typeof values[key] === 'undefined') {
                if (values_length == key + 1) {
                    insert_key = insert_key + keys[key];
                    insert_value = insert_value + null;
                } else {
                    insert_key = insert_key + keys[key] + ',';
                    insert_value = insert_value + null + ',';
                }
            } else {
                if (values_length == key + 1) {
                    insert_key = insert_key + keys[key];
                    insert_value = insert_value + `'${values[key]}'`;
                } else {
                    insert_key = insert_key + keys[key] + ',';
                    insert_value = insert_value + `'${values[key]}'` + ',';
                }
            }
        }
        let insert_query = `INSERT INTO ${table} (${insert_key}) VALUES (${insert_value})`;
        // console.log("insert_query======================>", insert_query)
        return (is_need_data) ? query(insert_query) : queryRetNo(insert_query);
    } catch (error) {
        console.log("error=======================>", error)
        createLogDb('error_query_insert_fail', { 'log': error.stack });
        return false;
    }
}
function update(table, fields, where, return_fields = '') {
    try {
        let sql_update = "UPDATE " + table + " SET ";
        let string = "";
        if (fields) {
            let field_len = Object.keys(fields).length;
            Object.keys(fields).map(function (key, index) {
                if (fields[key] === '' || fields[key] === null) {
                    if (field_len == index + 1) {
                        string = string + `${key}=null`;
                    } else {
                        string = string + `${key}=null,`;
                    }
                } else {
                    if (field_len == index + 1) {
                        string = string + `${key}='${fields[key]}'`;
                    } else {
                        string = string + `${key}='${fields[key]}',`;
                    }
                }
            });
        }
        sql_update += string;
        where = getWhereCondition(where)
        if (!where) {
            return false;
        }
        sql_update += where;
        if (return_fields != '') {
            sql_update += "RETURNING " + return_fields;
        }
        sql_update += ' ;'
        // console.log("sql_update=====================================================================>", sql_update)
        return query(sql_update);
    } catch (error) {
        let error_log = common.error_log_message('0', '0', error, where, "db_function.js", "update");
        createLogDb('common_else_error', error_log);
        return false;
    }
}
function insertOnDuplicateUpdate(table, fields, update_fields) {
    try {
        /*0073 remove escape_array */
        let insert_columns = Object.keys(fields);
        let values = Object.values(fields);
        let insert_query = "INSERT INTO " + table + " (" + insert_columns.join(',') + ") VALUES('" + values.join("','") + "')";
        let update_query = "UPDATE " + update_fields;
        let insert_on_duplicate_update_query = `${insert_query} ON DUPLICATE KEY ${update_query};`;
        insert_on_duplicate_update_query = common.str_replace(["'NULL'", "'null'"], 'NULL', insert_on_duplicate_update_query);
        return query(insert_on_duplicate_update_query);
    } catch (error) {
        let error_log = common.error_log_message('0', '0', error, '', "db_function.js", "insertOnDuplicateUpdate");
        createLogDb('error_common_else_cht_file', error_log);
        return false;
    }
}
// const getApiList = (api_main_url_arr, shop_info, query = {}, method = 'GET', headers = {}, is_log = 0) => {
//     try {
//         let merge_arr = Object.assign("", { '': config.SHOPIFY_API_VERSION }, api_main_url_arr);
//         merge_arr = Object.values(merge_arr);
//         let api_main_url = '/' + merge_arr.join('/') + '.json';
//         return shopify_req.shopify_call(shop_info.token, shop_info.store_name, api_main_url, query, method, headers, is_log);
//     } catch (e) {
//         const str = common.date_format('Y-m-d H:i:s') + "\n<br>shop_info:-" + JSON.stringify(shop_info) + "\n Api params: " + JSON.stringify({ api_main_url_arr: api_main_url_arr, query: query, method: method, headers: headers }) + " <br>Error:--->" + e.stack;
//         let log_arrs = {
//             log: common.replace_str_arr(["'", "\\\\'"], ["\'", "\'"], str)
//         };
//         createLogDb('error_getApiList_fn', log_arrs);
//         return {
//             'status': '',
//             'headers': '',
//             'response': ''
//         };
//     }
// }
const getStoreData = (shop = '') => {
    try {
        const where = {
            status: '1',
            store_name: common.mysql_real_escape_string(shop)
        };
        const common_field = 'token,money_format,iana_timezone,store_name,store_client_id,currency,shop_name,onboarding_status,app_status,store_theme_id';
        return selectedRows(config.TABLE_CLIENT_STORES, common_field, where);
    } catch (error) {
        const error_log = common.error_log_message(0, '0', error, shop, "db_functions.js", "getUserData");
        createLogDb('error_common_else_cht_file', error_log);
        return false;
    }
}
const prepareData = async (reqData, reqQuery = {}) => {
    let dataStatus = false;
    try {
        let shop_info = '';
        let shop = reqQuery.shop || reqData.shop || '';
        let store_client_id = reqQuery.store_client_id || reqData.store_client_id || '';
        if (!common.isRealValue(reqData.shopInfo)) {
            const client = await getStoreData(shop, store_client_id);
            if (client) {
                shop_info = client;
                store_client_id = shop_info.store_client_id;
                shop = shop_info.store_name;
                dataStatus = true;
            }
        } else {
            dataStatus = true;
            shop_info = reqData.shopInfo;
            shop_info.token = (shop_info.token) ? getEncryptDecryptData(config.ACTION_DECRYPT, shop_info.token) : '';
            shop_info.store_client_id = (shop_info.store_client_id) ? getEncryptDecryptData(config.ACTION_DECRYPT, shop_info.store_client_id) : "";
            store_client_id = shop_info.store_client_id;
            shop = shop_info.store_name;
            if (!(shop_info.token) || shop_info.token == false) {
                dataStatus = false;
                const str = "token = " + shop_info.token + "\nstore_data = " + JSON.stringify(shop_info) + "\npost_data = " + JSON.stringify(reqData);
                createLogDb('error_shop_token_false', {
                    'store_client_id': shop_info.scid,
                    'log': str
                });
            }
        }
        return {
            shop_info: shop_info,
            shop: shop,
            store_client_id: store_client_id,
            dataStatus: dataStatus
        };
    } catch (error) {
        console.log("error===============>", error)
        const error_log = common.error_log_message('0', '0', JSON.stringify(error), reqData, "db_function.js", "prepareData");
        createLogDb('error_common_else_cht_file', error_log);
        return {
            dataStatus: false
        };
    }
}
function selectResults(table, selected_field = '*', where = null, orderBy = null, groupBy = null, limit = null, offset = null) {
    try {
        let where1 = (where) ? getWhereCondition(where) : '';
        let sql = "SELECT " + selected_field + "  FROM " + table + " " + where1;
        if (groupBy) {
            sql += " GROUP BY " + groupBy + " ";
        }
        if (orderBy) {
            sql += " ORDER BY " + orderBy + " ";
        }
        if (offset && limit) {
            sql += " LIMIT  " + offset + "," + limit;
        }
        if (limit && !offset) {
            sql += " LIMIT  " + limit;
        }
        sql += ";";
        // console.log(sql, "sql")
        return query(sql);
    } catch (error) {
        let error_log = common.error_log_message('0', '0', error, where, "db_query.js", "selectResults");
        createLogDb('error_common_else_cht_file', error_log);
    }
}
async function getTotalData(table, where = null, group_by = null, join_arr = []) {
    try {
        where = (where) ? getWhereCondition(where) : '';
        let count = "COUNT(*)";
        if (common.isRealValue(group_by)) {
            count = "COUNT(DISTINCT  " + group_by + ")";
        }
        let sql = `SELECT ${count} as total_row FROM ${table}`;

        if (join_arr.length > 0) {
            for (let join in join_arr) {
                join = join_arr["join"];
                if (join['join_type'] == '') {
                    sql += " INNER JOIN " + join['table'] + " ON " + join['join_table_id'] + " = " + join['from_table_id'];
                } else {
                    sql += " " + join['join_type'] + " " + join['table'] + " ON " + join['join_table_id'] + " = " + join['from_table_id'];
                }
            }
        }
        sql += where + ';';
        let mysql_resource = await query(sql);
        if (mysql_resource.length > 0) {
            return mysql_resource[0].total_row;
        } else {
            return '0';
        }
    } catch (error) {
        createLogDb('error_common_else_cht_file', {
            'store_client_id': 0,
            'type': '0',
            'log': error.stack
        });
    }
}
const multipleUpdates = (table, field, array, where, key, value) => {
    try {
        let array_len = array.length; let sql = `UPDATE ${table} SET ${field}= CASE ${key}`; let where_arr = []
        if (array_len > 0) {
            while (array_len--) {
                sql += ` WHEN ${array[array_len][key]} THEN ${array[array_len][value]}`;
                where_arr.push(array[array_len][key])
            }
            sql += ` END WHERE ${key} IN (${where_arr}) AND ${where}`;
            return query(sql);
        } else {
            return false;
        }
    } catch (error) {
        createLogDb('error_common_else_cht_file', {
            'store_client_id': 0,
            'type': '0',
            'log': error.stack
        });
        return false;
    }
}
const getFieldName = (tableName, exclude_fields = []) => {
    try {
        let exclude_str = (exclude_fields.length > 0) ? `AND Field NOT IN(${exclude_fields})` : "";
        return `SHOW COLUMNS FROM ${tableName} WHERE COLUMNS.Key != 'PRI' ${exclude_str}`;
    } catch (error) {
        createLogDb('error_common_else_cht_file', {
            'store_client_id': 0,
            'type': '0',
            'log': error.stack
        });
        return false;
    }
}
const check_exists = (table, condition) => {
    try {
        let check_exists = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${condition} LIMIT 1) as is_exists`;
        return query(check_exists);
    } catch (error) {
        createLogDb('error_query_check_exits_fail', {
            'store_client_id': 0,
            'type': '0',
            'log': error.stack
        });
        return false;
    }
};

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function storeImage(matches, res, pathImg) {/* Store image in file */
    return new Promise(resolve => {
        try {
            let image = Buffer.from(matches[2], 'base64');
            let file_size = image.length / (1024 * 1024);
            let path = '';
            if ((matches.length != 3) || (!config.ALLOWED_IMG_TYPE.includes(matches[1])) || (file_size > 2)) {
                /* Do nothing */
                resolve(false);
            } else {
                let image_name = new Date().getTime() + '_' + randomNumber(0, 10000);
                path = image_name + matches[1].replace('image/', '.');
                let target_path = pathImg + path;
                let writeStream = fs.createWriteStream(target_path);
                /* write some data with a base64 encoding */
                writeStream.write(matches[2], 'base64');
                /* This is here incase any errors occur */
                writeStream.on('error', function (err) {
                    console.log(err,'error');
                });
                writeStream.on('finish', function () {
                    resolve(path);
                });
                /* close the stream */
                writeStream.end();
            }
        } catch (error) {
            console.log(error, "error")
            resolve('');
        }
    });
}



module.exports = {
    selectedRows,
    query,
    deleteRetNo,
    insert,
    update,
    getEncryptDecryptData,
    insertOnDuplicateUpdate,
    /*getApiList,*/
    prepareData,
    getStoreData,
    selectResults,
    getTotalData,
    multipleUpdates,
    queryRetNo,
    queryTransaction,
    getFieldName,
    check_exists,
    storeImage,
    randomNumber
}