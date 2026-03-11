const db = require("../db");

exports.getPermissions = async (req, res, next) => {

    console.log('getting permissions')

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
};

