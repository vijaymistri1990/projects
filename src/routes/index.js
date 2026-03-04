import express from "express";
import admin_route from './admin_route.js';
import user_route from './user_route.js';
import common_route from './common.js';
import SerpApi from 'google-search-results-nodejs';

const router = express.Router();

router.get("/test", async function (req, res) {
        res.send({ "result": "success", "msg": "Server successfully configured" })
});

router.use('/',admin_route);
router.use('/',user_route);

export default router;