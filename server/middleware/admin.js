const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customerId }
    });
    if (!customer || customer.phone !== process.env.ADMIN_PHONE) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};