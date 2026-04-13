const express = require("express");
const router = express.Router();
const db = require("../db");
const { encrypt, decrypt } = require("../services/secretService")


router.get("/settings", async (req, res, next) => {
    try {
        const sql = `
      SELECT [Key], UpdatedAt
      FROM AdminSettings
    `;

        const rows = await db.query(sql);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});


router.get("/settings/:key", async (req, res, next) => {

    try {
        const { key } = req.params;

        const sql = `
            SELECT *
            FROM AdminSettings
            WHERE [Key] = ?
        `;

       

        const rows = await db.query(sql, [key]);

        if (!rows.length) {
            return res.status(404).json({ error: "Not found" });
        }

        const row = rows[0];


        // ✅ correct decrypt input
        const decryptedValue = decrypt({
            value: row.Value,
            iv: row.Iv,
            tag: row.Tag
        });

        console.log(decryptedValue)


        return res.json({
            key: row.Key,
            value: decryptedValue
        });

    } catch (err) {
        next(err);
    }
});


router.post("/settings", async (req, res, next) => {
    try {
        const entries = req.body;

        console.log(entries)

        if (!entries || typeof entries !== "object") {
            return res.status(400).json({ error: "Invalid payload" });
        }

        for (const [key, rawValue] of Object.entries(entries)) {
            if (!rawValue) continue;

            const encrypted = encrypt(rawValue);

            const sql = `
                INSERT INTO AdminSettings (Key, Value, Iv, Tag, UpdatedAt)
                VALUES (?, ?, ?, ?, datetime('now'))
                ON CONFLICT(Key) DO UPDATE SET
                Value = excluded.Value,
                Iv = excluded.Iv,
                Tag = excluded.Tag,
                UpdatedAt = datetime('now');
            `;

            await db.query(sql, [
                key,
                encrypted.value,
                encrypted.iv,
                encrypted.tag
            ]);
        }

        res.json({ success: true });

    } catch (err) {
        next(err);
    }
});


router.get("/testcon", async (req, res, next) => {
    try {
        const { getAccessToken } = require("../services/msAuth");
        const axios = require("axios");

        const token = await getAccessToken();

        const response = await axios.get(
            "https://graph.microsoft.com/v1.0/users?$top=1",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return res.json({
            success: true,
            sampleUser: response.data?.value?.[0] || null,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.response?.data || err.message,
        });
    }
});

module.exports = router;