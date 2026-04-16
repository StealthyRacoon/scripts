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


const { sendSingleEmail } = require("../services/emailService");

router.post("/test-email", async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const success = await sendSingleEmail({
            to: email,
            subject: "Test Email",
            html: `
                <h1> Test Email </h1>
            `
        });

        res.json({
            success,
            message: "Email sent (or accepted by Microsoft Graph)"
        });

    } catch (err) {
        console.error(err.response?.data || err.message);
        next(err);
    }
});

router.post("/sendcampaignemail", async (req, res, next) => {
    try {
        const BASE_URL = "http://10.68.68.18/";

        const sql = `SELECT DISTINCT Email, Secret FROM SuperOwners`;
        const rows = await db.query(sql);

        const preview = [];
        const failed = [];
        const sent = [];
        const shouldSend = req.body.shouldSend;


        for (const row of rows) {
            const link = `${BASE_URL}${encodeURIComponent(row.Secret)}`;

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Permission Audit Tool</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

                    <p>Good morning,</p>

                    <p>
                        Please click the link below to access our new <strong>Permission Audit Tool</strong>.
                        On your page, you will find a list of sites you own.
                    </p>

                    <p>The image below shows what the tool looks like:</p>

                    <a href="http://10.68.68.18/images/1.png" target="_blank">
                        Audit Tool Preview
                    </a>
                    <br />
                    <a href="http://10.68.68.18/images/2.png" target="_blank">
                        Permissions Table Preview
                    </a>

                    <h3>How to complete your audit:</h3>
                    <ul>
                        <li>Open each site and approve or make changes to the permissions</li>
                        <li>Users are grouped by permission (full control, edit, read)</li>
                        <li>Use checkmark or bin buttons to approve/remove users</li>
                        <li>Add new users using Add User button</li>
                        <li>Submit your changes</li>
                    </ul>

                    <p>
                        Once submitted, your audit will be complete.
                    </p>

                    <p>
                        <a href="${link}" 
                           style="display:inline-block;padding:10px 20px;background:#0078D4;color:#fff;text-decoration:none;border-radius:4px;">
                            Open Permission Audit Tool
                        </a>
                    </p>

                    <p style="font-size:12px;color:#777;">
                        Note: This app can only be accessed within the network.
                    </p>

                </body>
                </html>
            `;

            // Build preview always (safe)
            const entry = {
                email: row.Email,
                secret: row.Secret,
                link,
                subject: "SharePoint Permissions Audit Instruction",
                htmlPreview: html
            };

            preview.push(entry);

            // OPTIONAL: future-safe send block (currently disabled for dry-run safety)

            console.log(shouldSend)
            if (shouldSend) {
                try {
                    if (row.Email === "sarang.gadhiya@sttas.com.au" || row.Email === "geoff.hudson@sttas.com.au") {
                    // if (true) {

                        await sendSingleEmail({
                            to: row.Email,
                            subject: entry.subject,
                            html
                        });

                        sent.push({
                            email: row.Email,
                            status: "sent"
                        });

                        // throttle for Graph safety
                        await new Promise(r => setTimeout(r, 150));
                    }


                } catch (err) {
                    failed.push({
                        email: row.Email,
                        error: err.message
                    });
                }
            }
        }

        res.status(200).json({
            message: shouldSend
                ? "Email process completed"
                : "DRY RUN - No emails were sent",
            total: rows.length,
            sentCount: sent.length,
            failedCount: failed.length,
            sent,
            failed,
            preview
        });

    } catch (err) {
        console.error(err.response?.data || err.message);
        next(err);
    }
});

module.exports = router;
