const db = require("../db");
const express = require("express");
const router = express.Router();



router.post("/campaigns", async (req, res, next) => {
  try {
    const { site, dueAt } = req.body;

    const insert = `
      INSERT INTO Campaigns (Site, InitiatedAt, DueAt, Status)
      VALUES (?, datetime('now'), ?, 'pending')
    `;

    const result = await db.query(insert, [site, dueAt || null]);

    res.status(201).json({
      message: "Campaign created",
      campaignId: result.lastID,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/campaigns", async (req, res, next) => {
  try {
    const query = `
      SELECT * FROM Campaigns
      ORDER BY InitiatedAt DESC
    `;

    const campaigns = await db.query(query);

    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

module.exports = router;