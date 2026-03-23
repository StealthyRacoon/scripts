const db = require("../db");
const express = require("express");
const router = express.Router();

/* ---------------- CREATE CAMPAIGN ---------------- */
/* Called when you send audit emails */

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

/* ---------------- GET ALL CAMPAIGNS ---------------- */

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

/* ---------------- GET CAMPAIGN OVERVIEW ---------------- */
/* Used by Admin dashboard (recommended endpoint) */

router.get("/campaigns/overview", async (req, res, next) => {
  try {
    const { campaignId } = req.query;

    const campaignQuery = `
      SELECT * FROM Campaigns
      ${campaignId ? "WHERE Id = ?" : ""}
    `;

    const campaigns = campaignId
      ? await db.query(campaignQuery, [campaignId])
      : await db.query(campaignQuery);

    const logsQuery = campaignId
      ? `SELECT * FROM AuditLogs WHERE campaignId = ?`
      : `SELECT * FROM AuditLogs`;

    const logs = campaignId
      ? await db.query(logsQuery, [campaignId])
      : await db.query(logsQuery);

    const ownersQuery = `
      SELECT URL, Email
      FROM SuperOwners
    `;

    const owners = await db.query(ownersQuery);

    /* ---------------- BUILD STATS ---------------- */

    const sites = {};

    for (const l of logs) {
      if (!sites[l.Site]) {
        sites[l.Site] = new Set();
      }
      sites[l.Site].add(l.UPN);
    }

    const expectedPerSite = {};
    for (const o of owners) {
      expectedPerSite[o.URL] = (expectedPerSite[o.URL] || 0) + 1;
    }

    let totalSites = Object.keys(expectedPerSite).length;
    let completedSites = 0;
    let inProgressSites = 0;

    const breakdown = Object.keys(expectedPerSite).map((site) => {
      const responses = sites[site] ? sites[site].size : 0;
      const expected = expectedPerSite[site];

      const completion = expected
        ? Math.round((responses / expected) * 100)
        : 0;

      let status = "not-started";
      if (responses === 0) status = "not-started";
      else if (responses < expected) status = "in-progress";
      else status = "completed";

      if (status === "completed") completedSites++;
      else if (status === "in-progress") inProgressSites++;

      return {
        site,
        responses,
        expected,
        completion,
        status,
      };
    });

    const lastAudit = await db.query(`
      SELECT MAX(timestamp) as lastAudit
      FROM AuditLogs
    `);

    res.json({
      summary: {
        totalSites,
        completedSites,
        inProgressSites,
        notStartedSites: totalSites - completedSites - inProgressSites,
        lastAudit: lastAudit?.[0]?.lastAudit || null,
      },
      breakdown,
      campaigns,
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- COMPLETE CAMPAIGN ---------------- */

router.post("/campaigns/:id/complete", async (req, res, next) => {
  try {
    const { id } = req.params;

    const update = `
      UPDATE Campaigns
      SET Status = 'completed',
          CompletedAt = datetime('now')
      WHERE Id = ?
    `;

    await db.query(update, [id]);

    res.json({ message: "Campaign marked as completed" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;