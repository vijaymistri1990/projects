'use strict';
const path = require('path');
const envPath = path.join(__dirname, `/config/.env_${process.env.SERVER}`);
require('dotenv').config({ path: envPath });
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config/config');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'assets/simulator_img')));

app.use(express.json({ limit: '50mb' }));
const whishlist = ['http://localhost:3000', 'http://localhost:3001','https://www.zianai.in'];
app.use(cors({ origin: whishlist }));
app.use(function (req, res, next) {
    const origin = (whishlist.includes(req.headers.origin)) ? req.headers.origin : res.send(`<h1 style="text-align:center">403 Forbidden</h1>
    <hr/>`);
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'access-token,refresh-token,Authorization, Authentication, Content-Type, origin,action, accept, token,withCredentials');
    res.setHeader('Access-Control-Expose-Headers', 'security_token,x-forwarded-for,Content-Disposition');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'no-store,max-age=0');
    next();
});
app.use(config.APP_PREFIX, routes);

app.use((req, res) => {
    const err = new Error('Not Found');
    err.status = 404;
    res.send({ 'status': err.status, 'message': 'Not found' });
});

app.set('port', Number(process.env.PORT) || 8000);
module.exports = { app, server };
