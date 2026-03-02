const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000; // or any port you like

// Middleware
app.use(cors());           // allow requests from frontend
app.use(express.json());   // parse JSON body

// --- Connect to SQLite ---
const dbPath = path.join(__dirname, '../Permissions.db'); // path to your SQLite file
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Get all users/permissions, optionally filtered by site
app.get('/api/permissions', (req, res) => {
    const site = req.query.site; // ?site=yourSiteURL
    let query = `
        SELECT *
        FROM SharePointPermissions
         `;
    let params = [];

    if (site) {
        query += ` WHERE URL = ? AND SharePointObject = 'Site'`;
        params.push(site);
    }

    query += ` ORDER BY URL, Permission, GivenThrough, Name;`;

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});


app.get('/api/sites', (req, res) => {
  const ownerName = req.query.owner;

  const query = `
    SELECT sp.*
    FROM SharePointPermissions sp
    JOIN SuperOwners so
      ON sp.URL LIKE so.URL || '%'
    WHERE so.Name = ?
    ORDER BY sp.URL, sp.[SharePointObject];
  `;

  db.all(query, [ownerName], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// --- Start server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});