const mysql = require('mysql');
const { db_config, db_log_config } = require('../config/config');
const conn = mysql.createPool(db_config);
const log_conn = mysql.createPool(db_log_config);

module.exports = {
    conn,
    log_conn
};
