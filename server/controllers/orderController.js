const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        customerId: req.customerId,
        total,
        items: {
          create: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price
          }))
        }
      },
      include: { items: true }
    });

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.customerId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};