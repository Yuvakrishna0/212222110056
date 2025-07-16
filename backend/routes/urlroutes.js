const express = require("express");
const router = express.Router();
const { createShortUrl, getStats } = require("../controller/urlcontroller");

router.post("/shorturls", createShortUrl);
router.get("/shorturls/:shortcode", getStats);

module.exports = router;