const common = require("common-utils")
const { log_conn } = require('./db_connect');
const createLogDb = (table = 'general', log_data = null, query = null) => {
    if (!common.isRealValue(query)) {
        if (log_data) {
            let fields = Object.keys(log_data).join(',');
            let values = Object.values(log_data);
            console.log("values================>", values)
            values = values.map(ele => {
                return common.mysql_real_escape_string(ele)
            })
            values = values.join("','");
            query = `INSERT INTO ${table} (${fields}) VALUES('${values}')`;
        }
    }
    log_conn.query(query, function (err, data) {
        if (!err) {
            return true;
        } else {
            log_data = !common.isRealValue(query) ? log_data : query;
            let arr_log = `{'table':${table},'log_data':${log_data}`;
            log_data = common.mysql_real_escape_string(arr_log)
            let query1 = "INSERT INTO general(type,log) VALUES('1','" + log_data + "')";
            log_conn.query(query1, function (error, data1) {
                return !error;
            })
        }
    });
}

module.exports = { createLogDb }