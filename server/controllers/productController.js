const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Convert DB string "url1,url2,url3" → array for frontend
function formatProduct(p) {
  return { ...p, images: p.images ? p.images.split(',').filter(Boolean) : [] };
}

exports.list = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const where = {};

    if (category) {
      where.OR = [
        { category: category },
        { category: { startsWith: `${category}-` } }
      ];
    }

    if (search) {
      where.name = { contains: search };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { views: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const products = await prisma.product.findMany({ where, orderBy });
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error('List products error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { views: { increment: 1 } }
    });
    res.json(formatProduct(product));
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, oldPrice, category, images, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Name, description, price, category required' });
    }

    const imagesStr = Array.isArray(images)
      ? images.join(',')
      : (images || '');

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        category,
        images: imagesStr,
        stock: stock ? parseInt(stock) : 0
      }
    });

    res.json(formatProduct(product));
  } catch (err) {
    console.error('Create product error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    if (Array.isArray(data.images)) data.images = data.images.join(',');
    if (data.price) data.price = parseFloat(data.price);
    if (data.oldPrice) data.oldPrice = parseFloat(data.oldPrice);
    if (data.stock) data.stock = parseInt(data.stock);

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(formatProduct(product));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.trending = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { views: 'desc' },
      take: 10
    });
    res.json(products.map(formatProduct));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// NEW: latest products — used by the Hero to rotate through newest uploads
exports.latest = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(products.map(formatProduct));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Debug helper — lists all distinct categories and counts
exports.categories = async (req, res) => {
  try {
    const all = await prisma.product.findMany({
      select: { category: true }
    });
    const counts = {};
    for (const p of all) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    res.json(counts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};