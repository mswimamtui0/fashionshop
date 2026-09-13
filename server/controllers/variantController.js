const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listByProduct = async (req, res) => {
  try {
    const variants = await prisma.variant.findMany({
      where: { productId: parseInt(req.params.productId) },
      orderBy: { createdAt: 'asc' }
    });
    res.json(variants);
  } catch (err) {
    console.error('listByProduct error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { productId, color, size, stock, price } = req.body;

    if (!productId || !color) {
      return res.status(400).json({ error: 'productId and color required' });
    }

    const variant = await prisma.variant.create({
      data: {
        productId: parseInt(productId),
        color,
        size: size || null,
        stock: stock !== undefined && stock !== '' ? parseInt(stock) : 0,
        price: price ? parseFloat(price) : null
      }
    });
    res.json(variant);
  } catch (err) {
    console.error('create variant error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { color, size, stock, price } = req.body;
    const variant = await prisma.variant.update({
      where: { id: parseInt(req.params.id) },
      data: {
        color,
        size: size || null,
        stock: stock !== undefined && stock !== '' ? parseInt(stock) : 0,
        price: price ? parseFloat(price) : null
      }
    });
    res.json(variant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.variant.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};