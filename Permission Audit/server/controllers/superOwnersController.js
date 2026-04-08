const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");
const { getActiveCampaign } = require("../services/campaignService");


router.get("/superownerspermissions", async (req, res, next) => {
    const owner = req.query.owner;

    try {
        const activeCampaign = await getActiveCampaign();

        if (!activeCampaign) {
            return res.status(403).json({
                message: "No audit in progress",
            });
        }

        const campaignId = activeCampaign.Id;

        // SELECT 
        //     so.Name AS superOwner,
        //     so.*,
        //     sp.*
        // FROM SharePointPermissions sp
        // JOIN SuperOwners so
        //     ON sp.URL = so.URL
        // WHERE so.Secret = "?";

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
    AND al.principal = sp.Name
--    AND al.UPN = sp.Email
--    AND al.Permission = sp.Permission
WHERE so.Secret = ?;
        `;


        const rows = await db.query(sql, [owner]);

        res.json({ rows, campaignId });
    } catch (err) {
        next(err);
    }
});

router.get("/sites", async (req, res, next) => {

    try {

        const sql = `
       SELECT 
            so.Name AS superOwner,
            so.*,
            sp.*
        FROM SharePointPermissions sp
        JOIN SuperOwners so
            ON sp.URL = so.URL
        `;
        // WHERE so.Name = ?

        const rows = await db.query(sql);

        res.json(rows);
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

router.get("/superowners", async (req, res, next) => {
    try {
        const campaignId = req.query.campaignId;
        let query = `
            SELECT *
            FROM SuperOwners
        `;
        if (campaignId) {
            query += ` WHERE campaignId = ?`;
        }
        const rows = await db.query(query, campaignId ? [campaignId] : []);
        res.json(rows);

    } catch (err) {
        next(err);
    }
});

router.post("/superowners", async (req, res, next) => {
    try {
        const { rows, firstChunk } = req.body;

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ message: "No data provided" });
        }

        const campaignId = rows[0].campaignId;
        if (!campaignId) {
            return res.status(400).json({ message: "campaignId is required" });
        }

        // ✅ Only remove existing SuperOwners on the first chunk
        if (firstChunk) {
            await db.query(
                "DELETE FROM SuperOwners WHERE campaignId = ?",
                [campaignId]
            );
        }

        // ✅ Fill missing Email or Name from SharePointPermissions
        const rowsWithData = await Promise.all(
            rows.map(async (row) => {
                // If Email is missing but Name exists
                if (!row.Email && row.Name) {
                    const result = await db.query(
                        "SELECT Email FROM SharePointPermissions WHERE Name = ? AND Email IS NOT NULL LIMIT 1",
                        [row.Name]
                    );
                    if (result.length > 0 && result[0].Email) {
                        row.Email = result[0].Email;
                    }
                }

                // If Name is missing but Email exists
                if (!row.Name && row.Email) {
                    const result = await db.query(
                        "SELECT Name FROM SharePointPermissions WHERE Email = ? AND Name IS NOT NULL LIMIT 1",
                        [row.Email]
                    );
                    if (result.length > 0 && result[0].Name) {
                        row.Name = result[0].Name;
                    }
                }

                return row;
            })
        );

        // ✅ Prepare insertion into SuperOwners
        const columns = ["URL", "Name", "Email", "campaignId"];
        const valuesPlaceholders = rowsWithData
            .map(() => "(" + columns.map(() => "?").join(", ") + ")")
            .join(", ");

        const values = rowsWithData.flatMap((row) =>
            columns.map((col) => row[col] ?? null)
        );

        const insertQuery = `
      INSERT INTO SuperOwners (${columns.join(", ")})
      VALUES ${valuesPlaceholders}
    `;

        await db.query(insertQuery, values);

        res.status(200).json({
            message: firstChunk
                ? "First chunk uploaded and previous SuperOwners removed"
                : "Chunk uploaded successfully",
            inserted: rowsWithData.length,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
