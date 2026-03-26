const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/permissions", async (req, res, next) => {
    try {
        const site = req.query.site;
        let query = `
            SELECT *
            FROM SharePointPermissions
            WHERE ObjectType = 'Site'
        `;

        const params = [];
        if (site) {
            query += ` AND URL = ?`;
            params.push(site);
        }
        query += ` ORDER BY URL, Permission, GivenThrough, Name`;
        const rows = await db.query(query, params);
        res.json(rows);

    } catch (err) {
        next(err);
    }
});

router.get("/users", async (req, res, next) => {
    try {
        let query = `
            SELECT DISTINCT TRIM(LOWER(Email)) AS Email, TRIM(Name) AS Name
            FROM SharePointPermissions
            WHERE Email IS NOT NULL AND Email <> '';
        `;
        const rows = await db.query(query);
        res.json(rows);

    } catch (err) {
        next(err);
    }
});

router.post("/uploadreport", async (req, res, next) => {
  try {
    const { rows, firstChunk } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    const campaignId = rows[0].campaignId;
    if (!campaignId) {
      return res.status(400).json({ message: "campaignId is required" });
    }

    // ✅ Only remove existing records on the first chunk
    if (firstChunk) {
      await db.query(
        "DELETE FROM SharePointPermissions WHERE campaignId = ?",
        [campaignId]
      );
    }

    // ✅ Insert rows in this chunk
    const columns = Object.keys(rows[0]).join(", ");
    const valuesPlaceholders = rows
      .map(
        () =>
          "(" + Object.keys(rows[0]).map(() => "?").join(", ") + ")"
      )
      .join(", ");

    const values = rows.flatMap((row) =>
      Object.keys(rows[0]).map((col) => row[col] ?? null)
    );

    const insertQuery = `
      INSERT INTO SharePointPermissions (${columns})
      VALUES ${valuesPlaceholders}
    `;

    await db.query(insertQuery, values);

    res.status(200).json({
      message: firstChunk
        ? "First chunk uploaded and previous campaign data removed"
        : "Chunk uploaded successfully",
      inserted: rows.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
