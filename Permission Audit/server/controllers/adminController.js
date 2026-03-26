const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");
const { getActiveCampaign } = require("../services/campaignService");


router.get("/adminpermissions", async (req, res, next) => {

    try {
        const activeCampaign = await getActiveCampaign();

        if (!activeCampaign) {
            return res.status(403).json({
                message: "No audit in progress",
            });
        }

        const campaignId = activeCampaign.Id;

        const sql = `
         SELECT
            so.Name AS superOwner,
            so.*,
            sp.*,
            al.id                AS auditId,
            al.Decision,
            al.adminApproved,
            al.adminApprovedTimestamp,
            al.timestamp         AS auditTimestamp,
            al.GroupName,
            al.Permission        AS auditedPermission,
            al.campaignId
        FROM SharePointPermissions sp
        JOIN SuperOwners so
            ON sp.URL = so.URL
        LEFT JOIN AuditLogs al
            ON al.site = sp.URL
            AND al.library = sp.SharePointObject
            AND al.principal = sp.Name;
        `;
        const rows = await db.query(sql);

        res.json({ rows, campaignId });
    } catch (err) {
        next(err);
    }
});

router.get("/adminsites", async (req, res, next) => {

    try {
        const sql = `SELECT * FROM SuperOwners`;
        const rows = await db.query(sql);
        res.json({ sites: rows.map(r => r.URL) });
    } catch (err) {
        next(err);
    }
});



router.get("/auditlogs", async (req, res, next) => {
    try {
        const sql = `SELECT * FROM AuditLogs`;
        const rows = await db.query(sql);
        res.json({ auditLogs: rows });
    } catch (err) {
        next(err);
    }
});


router.get("/changesecrets", async (req, res, next) => {
    try {

        // Get unique users
        const users = await db.query(`
            SELECT Email, Name
            FROM SuperOwners
            GROUP BY Email
        `);

        for (const user of users) {
            //Runs multiple times for duplicate emails, a secret for duplicate emails is generated multiple times. To be fixed


            const secret = crypto
                .createHash("sha256")
                .update(user.Name + user.Email + crypto.randomBytes(16))
                .digest("hex");

            // Update ALL rows with this email
            await db.run(
                `UPDATE SuperOwners SET Secret = ? WHERE Email = ?`,
                [secret, user.Email]
            );
        }

        res.json({ success: true });

    } catch (err) {
        next(err);
    }
});


module.exports = router;