const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, consentSMS } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashed,
        consentSMS: consentSMS !== false
      }
    });

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      customer: { id: customer.id, name: customer.name, phone: customer.phone }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      return res.status(400).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      customer: { id: customer.id, name: customer.name, phone: customer.phone }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customerId },
      select: { id: true, name: true, phone: true, email: true }
    });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};