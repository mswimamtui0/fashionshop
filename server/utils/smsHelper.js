const axios = require('axios');

async function sendSMS(recipients, message) {
  return axios.post(process.env.SMS_API_URL, {
    api_key: process.env.SMS_API_KEY,
    sender_id: process.env.SMS_SENDER_ID,
    message,
    recipients
  });
}

module.exports = { sendSMS };
