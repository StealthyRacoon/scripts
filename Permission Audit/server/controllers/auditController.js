const db = require("../db");

const express = require("express");
const router = express.Router();

router.post("/audit", async (req, res, next) => {
    try {
        const logs = req.body;
        const timestamp = new Date().toISOString();
        const insertQuery = `
            INSERT INTO AuditLogs (
            Principal,
            Site,
            Library,
            UPN, 
            Permission, 
            GroupName,
            Decision, 
            timestamp,
            adminApproved
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, False)
        `;
        for (const log of logs) {
            const { principal, site, library, UPN, perm, group, decision } = log;
            await db.query(insertQuery, [principal, site, library, UPN, perm, group, decision, timestamp]);
        }
        res.status(201).json({ message: "Audit log saved successfully" });
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
