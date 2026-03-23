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

module.exports = router;
