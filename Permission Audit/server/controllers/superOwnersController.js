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

                            <p>
                                The image below shows what the different components of the tool look like:
                            </p>

                            <!-- Optional image -->
                            <a>
                                <img src="https://10.68.68.18/images/1.png" alt="Audit Tool Overview" style="max-width: 100%; height: auto;" />
                            </a>
                            <a>
                                <img src="https://10.68.68.18/images/2.png" alt="Audit Tool Overview" style="max-width: 100%; height: auto;" />
                            </a>

                            <h3>How to complete your audit:</h3>
                            <ul>
                                <li>Open each site and review permissions</li>
                                <li>Users are grouped by permission level (Full Control, Edit, Read)</li>
                                <li>Use the ✔️ checkmark to approve or 🗑️ bin icon to remove users</li>
                                <li>Add new users using the <strong>"Add User"</strong> button</li>
                                <li>Submit your changes</li>
                            </ul>

                            <p>
                                Once you have submitted your approved permissions for all sites,
                                you will have completed your portion of the audit.
                            </p>

                            <p>
                                Now try it out using the link below:
                            </p>

                            <p>
                                <a href="{{LINK}}" 
                                style="display: inline-block; padding: 10px 20px; background-color: #0078D4; color: #ffffff; text-decoration: none; border-radius: 4px;">
                                    Open Permission Audit Tool
                                </a>
                            </p>

                            <p style="font-size: 12px; color: #777;">
                                <strong>Note:</strong> This application can only be accessed within the network.
                            </p>

                        </body>
                        </html>
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
        const BASE_URL = process.env.BASE_URL || "http://http://10.68.68.18/";

        const sql = `SELECT DISTINCT Email, Secret FROM SuperOwners`;
        const rows = await db.query(sql);

        let success = 0;
        const failed = [];

        for (const row of rows) {
            const link = `${BASE_URL}${encodeURIComponent(row.Secret)}`;

            try {
                await sendSingleEmail({
                    to: row.Email,
                    subject: "SharePoint Permissions Audit Instruction",
                    html: `
                        <p>Hello,</p>
                        <p>Please use the link below to access your audit:</p>
                        <p><a href="${link}">Open your link</a></p>
                    `
                });

                success++;

                await new Promise(r => setTimeout(r, 150));

            } catch (err) {
                console.error(`Failed for ${row.Email}`, err.response?.data || err.message);

                failed.push({
                    email: row.Email,
                    error: err.message
                });
            }
        }

        res.status(200).json({
            message: "Email process completed",
            total: rows.length,
            success,
            failedCount: failed.length,
            failed
        });

    } catch (err) {
        console.error(err.response?.data || err.message);
        next(err);
    }
});

module.exports = router;
