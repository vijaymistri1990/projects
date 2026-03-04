import { Pool } from 'pg';
import config from '../config/config.js';

const { db_config, db_log_config } = config;

// Create PostgreSQL connection pools
const conn = new Pool(db_config);
const log_conn = new Pool(db_log_config);

// Handle connection errors
conn.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

log_conn.on('error', (err) => {
    console.error('Unexpected error on idle log client', err);
    process.exit(-1);
});

export {
    conn,
    log_conn
};
