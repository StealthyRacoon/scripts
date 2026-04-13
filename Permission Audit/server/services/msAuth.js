const axios = require("axios");
const db = require("../db");
const { decrypt } = require("../services/secretService");

/**
 * =========================================================
 * SETTINGS CACHE (optional performance layer)
 * =========================================================
 */
let settingsCache = null;
let settingsCacheExpiresAt = 0;

const SETTINGS_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * =========================================================
 * GET SINGLE SETTING (DECRYPTED)
 * =========================================================
 */
async function getSetting(key) {
    const sql = `
        SELECT [Key], [Value], [Iv], [Tag]
        FROM AdminSettings
        WHERE [Key] = ?
    `;

    const rows = await db.query(sql, [key]);

    if (!rows || rows.length === 0) {
        return null;
    }

    const row = rows[0];

    return decrypt({
        value: row.Value,
        iv: row.Iv,
        tag: row.Tag
    });
}

/**
 * =========================================================
 * GET MULTIPLE SETTINGS (DECRYPTED + CACHED)
 * =========================================================
 */
async function getSettings(keys = []) {
    if (!keys.length) return {};

    const now = Date.now();

    // 1. return cache if valid
    if (settingsCache && now < settingsCacheExpiresAt) {
        const result = {};
        for (const k of keys) {
            if (settingsCache[k]) {
                result[k] = settingsCache[k];
            }
        }
        return result;
    }

    // 2. fetch from DB
    const placeholders = keys.map(() => "?").join(",");

    const sql = `
        SELECT [Key], [Value], [Iv], [Tag]
        FROM AdminSettings
        WHERE [Key] IN (${placeholders})
    `;

    const rows = await db.query(sql, keys);

    const result = {};

    for (const row of rows) {
        result[row.Key] = decrypt({
            value: row.Value,
            iv: row.Iv,
            tag: row.Tag
        });
    }

    // 3. update cache (merge)
    settingsCache = {
        ...settingsCache,
        ...result
    };

    settingsCacheExpiresAt = now + SETTINGS_TTL;

    return result;
}

/**
 * =========================================================
 * TOKEN CACHE
 * =========================================================
 */
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * =========================================================
 * GET MICROSOFT GRAPH ACCESS TOKEN
 * =========================================================
 * Uses DB-backed encrypted settings
 */
async function getAccessToken() {
    const now = Date.now();

    // 1. return cached token if valid
    if (cachedToken && now < tokenExpiresAt - 60000) {
        return cachedToken;
    }

    // 2. load credentials from DB (decrypted)
    const settings = await getSettings([
        "tenantId",
        "clientId",
        "clientSecret"
    ]);

    const tenantId = settings.tenantId;
    const clientId = settings.clientId;
    const clientSecret = settings.clientSecret;

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error("Missing Microsoft auth configuration in DB");
    }

    // 3. request token from Microsoft Entra ID
    const tokenUrl =
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("grant_type", "client_credentials");

    const response = await axios.post(tokenUrl, params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const data = response.data;

    if (!data.access_token) {
        throw new Error("Failed to retrieve Microsoft Graph access token");
    }

    // 4. cache token
    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;

    return cachedToken;
}

/**
 * =========================================================
 * EXPORTS
 * =========================================================
 */
module.exports = {
    getAccessToken,
    getSetting,
    getSettings,
};