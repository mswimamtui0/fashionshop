const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.sendBulk = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const customers = await prisma.customer.findMany({
      where: { consentSMS: true },
      select: { phone: true }
    });

    const recipients = customers.map(c => c.phone);

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No customers with SMS consent' });
    }

    const response = await axios.post(process.env.SMS_API_URL, {
      api_key: process.env.SMS_API_KEY,
      sender_id: process.env.SMS_SENDER_ID,
      message,
      recipients
    });

    await prisma.smsLog.create({
      data: { message, recipients: recipients.length }
    });

    res.json({ success: true, sent: recipients.length, platform: response.data });
  } catch (err) {
    console.error('SMS error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.notifyNewProduct = async (product) => {
  try {
    const message = `🔥 New Arrival: ${product.name} - TZS ${product.price}. Shop: yoursite.com/product/${product.id}`;
    const customers = await prisma.customer.findMany({
      where: { consentSMS: true },
      select: { phone: true }
    });

    if (customers.length === 0) return;

    await axios.post(process.env.SMS_API_URL, {
      api_key: process.env.SMS_API_KEY,
      sender_id: process.env.SMS_SENDER_ID,
      message,
      recipients: customers.map(c => c.phone)
    });
  } catch (err) {
    console.error('SMS notify failed:', err.message);
  }
};

exports.logs = async (req, res) => {
  try {
    const logs = await prisma.smsLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};