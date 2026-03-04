import { Sequelize } from 'sequelize';

// Main database connection
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
            idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
);

// Log database connection
const logSequelize = new Sequelize(
    process.env.DB_LOG_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
            idle: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000
        },
        logging: false
    }
);

export {
    sequelize,
    logSequelize
};