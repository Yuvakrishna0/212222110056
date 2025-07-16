const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const Log = require("../middleware/logger");

const createShortUrl = async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url || typeof url !== "string") {
      await Log("backend", "error", "handler", "Invalid or missing URL");
      return res.status(400).json({ error: "Invalid or missing URL" });
    }

    let short = shortcode || nanoid(6);
    const existing = await Url.findOne({ shortcode: short });

    if (existing) {
      await Log("backend", "warn", "handler", "Shortcode already in use");
      return res.status(400).json({ error: "Shortcode already in use" });
    }

    const minutes = validity ? parseInt(validity, 10) : 30;
    const expiryDate = new Date(Date.now() + minutes * 60000);

    const newUrl = new Url({
      longUrl: url,
      shortcode: short,
      expiryDate
    });

    await newUrl.save();
    await Log("backend", "info", "db", `Shortcode created: ${short}`);

    res.status(201).json({
      shortLink: `http://localhost:${process.env.PORT}/${short}`,
      expiry: expiryDate.toISOString()
    });

  } catch (err) {
    await Log("backend", "fatal", "db", "Failed to create short URL");
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getStats = async (req, res) => {
  try {
    const code = req.params.shortcode;
    const urlData = await Url.findOne({ shortcode: code });

    if (!urlData) {
      await Log("backend", "error", "db", "Shortcode not found");
      return res.status(404).json({ error: "Shortcode not found" });
    }

    const stats = {
      longUrl: urlData.longUrl,
      createdAt: urlData.createdAt,
      expiryDate: urlData.expiryDate,
      totalClicks: urlData.clicks?.length || 0,
      clicks: urlData.clicks
    };

    await Log("backend", "info", "handler", `Stats fetched for ${code}`);
    res.status(200).json(stats);
  } catch (err) {
    await Log("backend", "fatal", "handler", "Failed to fetch stats");
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { createShortUrl, getStats };