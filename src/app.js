'use strict';
import path from 'path';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import config from './config/config.js';
import http from 'http';

// Initialize Sequelize models
import { sequelize, logSequelize } from './models/index.js';

// Test database connections
async function initializeDatabase() {
    try {
        console.log('Attempting to connect to database with:');
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Port: ${process.env.DB_PORT}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`Log Database: ${process.env.DB_LOG_NAME}`);

        await sequelize.authenticate();
        console.log('Main database connection established successfully.');

        await logSequelize.authenticate();
        console.log('Log database connection established successfully.');

        // Sync models with database (creates tables if they don't exist)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            await logSequelize.sync({ alter: true });
            console.log('Database models synchronized successfully.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        console.log('App will continue running without database connection.');
        console.log('Please check your PostgreSQL server and database configuration.');
        // Don't exit the process, let the app continue running
    }
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize database on startup
initializeDatabase();

app.use(express.static(path.join(__dirname, 'assets/simulator_img')));

app.use(express.json({ limit: '50mb' }));
const whishlist = ['http://localhost:3000', 'http://localhost:3001', 'https://www.zianai.in'];
app.use(cors({ origin: whishlist }));
app.use(function (req, res, next) {
    if (!whishlist.includes(req.headers.origin) && req.headers.origin) {
        return res.status(403).send(`<h1 style="text-align:center">403 Forbidden</h1><hr/>`);
    }
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'access-token,refresh-token,Authorization, Authentication, Content-Type, origin,action, accept, token,withCredentials');
    res.setHeader('Access-Control-Expose-Headers', 'security_token,x-forwarded-for,Content-Disposition');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'no-store,max-age=0');
    next();
});
app.use(config.APP_PREFIX || '/api', routes);

app.use((req, res) => {
    const err = new Error('Not Found');
    err.status = 404;
    res.send({ 'status': err.status, 'message': 'Not found' });
});

app.set('port', Number(process.env.PORT) || 8000);
export { app, server };
