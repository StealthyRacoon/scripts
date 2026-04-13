const crypto = require("crypto");

function generateSecret(name, email) {
    return crypto
        .createHash("sha256")
        .update(name + email + crypto.randomBytes(16))
        .digest("hex");
}

const alg = "aes-256-gcm";


const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("oieryth34yntp93chpt2htp94h5ntpmvm4wjhcpiwhntc54hnc9p4v5y9umw4seg")
  .digest();


function encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(alg, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");

    const tag = cipher.getAuthTag();

    return {
        value: encrypted,
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
    };
}

function decrypt({ value, iv, tag }) {
    const decipher = crypto.createDecipheriv(
        alg,
        ENCRYPTION_KEY,
        Buffer.from(iv, "base64")
    );

    decipher.setAuthTag(Buffer.from(tag, "base64"));

    let decrypted = decipher.update(value, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

module.exports = { generateSecret, encrypt, decrypt };