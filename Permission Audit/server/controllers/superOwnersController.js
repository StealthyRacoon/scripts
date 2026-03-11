const db = require("../db");


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
        WHERE so.Name = ?
        `;

        const rows = await db.query(sql, [owner]);

        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getSites = async (req, res, next) => {
    const owner = req.query.owner;

    try {

        const sql = `
        SELECT sp.*
        FROM SharePointPermissions sp
        JOIN SuperOwners so
        ON sp.URL LIKE so.URL || '%'
        WHERE so.Name = ?
        ORDER BY sp.URL, sp.[SharePointObject];
        `;

        const rows = await db.query(sql, [owner]);

        res.json(rows);
    } catch (err) {
        next(err);
    }
}


function getOwners() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Id, Name, Email FROM SuperOwners`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


const crypto = require("crypto");

exports.changeSecrets = async (req, res, next) => {
    try {

        const owners = await getOwners();

        for (const owner of owners) {

            const secret = crypto
                .createHash('sha256')
                .update(owner.Name + owner.Email + crypto.randomBytes(16))
                .digest('hex');

            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE SuperOwners SET Secret = ? WHERE Id = ?`,
                    [secret, owner.Id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        res.json({ success: true });

    } catch (err) {
        next(err);
    }
}