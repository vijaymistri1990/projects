const express = require("express");
const router = express.Router();
const admin_route = require('./admin_route');
const user_route = require('./user_route');
const common_route = require('./common');
const SerpApi = require('google-search-results-nodejs')

router.get("/test", async function (req, res) {
        res.send({ "result": "success", "msg": "Server successfully configured" })
});

router.use('/',admin_route);
router.use('/',user_route);

module.exports = router;