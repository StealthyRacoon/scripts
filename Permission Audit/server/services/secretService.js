const crypto = require("crypto");

function generateSecret(name, email) {
    return crypto
        .createHash("sha256")
        .update(name + email + crypto.randomBytes(16))
        .digest("hex");
}

module.exports = { generateSecret };