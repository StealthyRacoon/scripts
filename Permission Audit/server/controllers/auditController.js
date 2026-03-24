const db = require("../db");

const express = require("express");
const router = express.Router();
const { getActiveCampaign } = require("../services/campaignService");


router.post("/audit", async (req, res, next) => {
    const logs = req.body;
    const timestamp = new Date().toISOString();

    try {
        const activeCampaign = await getActiveCampaign();

        if (!activeCampaign) {
            return res.status(403).json({
                message: "No audit in progress",
            });
        }

        const campaignId = activeCampaign.Id;

        const upsertQuery = `
      INSERT INTO AuditLogs (
        principal,
        site,
        library,
        UPN,
        Permission,
        GroupName,
        Decision,
        timestamp,
        adminApproved,
        campaignId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, False, ?)
      ON CONFLICT (site, library, principal, UPN, campaignId)
      DO UPDATE SET
        Decision = excluded.Decision,
        timestamp = excluded.timestamp
    `;

        for (const log of logs) {
            const {
                principal,
                site,
                library,
                UPN,
                Permission,
                GroupName,
                Decision,
            } = log;

            await db.query(upsertQuery, [
                principal,
                site,
                library,
                UPN,
                Permission,
                GroupName,
                Decision,
                timestamp,
                campaignId,
            ]);
        }

        res.status(201).json({
            message: "Audit log saved successfully",
            campaignId,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/audit", async (req, res, next) => {
    try {
        const selectQuery = `
            SELECT * FROM AuditLogs
        `;
        const [rows] = await db.query(selectQuery);
        res.status(200).json(rows);
    } catch (err) {
        next(err);
    }
});



module.exports = router;
