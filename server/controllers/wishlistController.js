const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function formatProduct(p) {
  return { ...p, images: p.images ? p.images.split(',').filter(Boolean) : [] };
}

exports.list = async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { customerId: req.customerId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items.map(w => ({ id: w.id, product: formatProduct(w.product) })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const existing = await prisma.wishlist.findUnique({
      where: {
        productId_customerId: {
          productId: parseInt(productId),
          customerId: req.customerId
        }
      }
    });
    if (existing) return res.json(existing);

    const w = await prisma.wishlist.create({
      data: { productId: parseInt(productId), customerId: req.customerId }
    });
    res.json(w);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.wishlist.deleteMany({
      where: {
        productId: parseInt(req.params.productId),
        customerId: req.customerId
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.check = async (req, res) => {
  try {
    const w = await prisma.wishlist.findUnique({
      where: {
        productId_customerId: {
          productId: parseInt(req.params.productId),
          customerId: req.customerId
        }
      }
    });
    res.json({ liked: !!w });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};