const db = require("../db");

async function getActiveCampaign() {
  const query = `
    SELECT Id
    FROM Campaigns
    WHERE Status = 'pending'
    ORDER BY InitiatedAt DESC
    LIMIT 1
  `;

  const rows = await db.query(query);
  return rows[0] || null;
}

module.exports = {
  getActiveCampaign,
};