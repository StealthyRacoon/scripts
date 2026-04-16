const axios = require("axios");
const { getAccessToken, getSetting } = require("./msAuth");

async function sendSingleEmail({ to, subject, html }) {
    const token = await getAccessToken();

    const sender = "spadmin@sttas.com.au"

    if (!sender) {
        throw new Error("Missing senderEmail in AdminSettings");
    }

    const url = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;

    const payload = {
        message: {
            subject,
            body: {
                contentType: "HTML",
                content: html
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: to
                    }
                }
            ]
        },
        saveToSentItems: true
    };

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    return response.status === 202;
}

module.exports = {
    sendSingleEmail
};