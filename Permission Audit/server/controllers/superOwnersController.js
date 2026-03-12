const db = require("../db");
const crypto = require("crypto");

exports.getSuperOwnersPermissions = async (req, res, next) => {
    const owner = req.query.owner;

    try {
        const sql = `
        SELECT 
            so.Name AS superOwner,
            so.*,
            sp.*
        FROM SharePointPermissions sp
        JOIN SuperOwners so
            ON sp.URL = so.URL
        WHERE so.Secret = ?
        `;

        const rows = await db.query(sql, [owner]);

        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getSites = async (req, res, next) => {

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
}

exports.changeSecrets = async (req, res, next) => {
    try {

        // Get unique users
        const users = await db.query(`
            SELECT Email, Name
            FROM SuperOwners
            GROUP BY Email
        `);

        for (const user of users) {

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
};