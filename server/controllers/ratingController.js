const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List all ratings for a product
exports.listByProduct = async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { productId: parseInt(req.params.productId) },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const count = ratings.length;
    const average = count
      ? ratings.reduce((s, r) => s + r.stars, 0) / count
      : 0;

    res.json({ ratings, count, average });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create or update rating (one per customer per product)
exports.create = async (req, res) => {
  try {
    const { productId, stars, comment } = req.body;

    if (!productId || !stars) {
      return res.status(400).json({ error: 'productId and stars required' });
    }
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars must be 1-5' });
    }

    const rating = await prisma.rating.upsert({
      where: {
        productId_customerId: {
          productId: parseInt(productId),
          customerId: req.customerId
        }
      },
      update: { stars: parseInt(stars), comment: comment || null },
      create: {
        productId: parseInt(productId),
        customerId: req.customerId,
        stars: parseInt(stars),
        comment: comment || null
      }
    });

    res.json(rating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get my rating for a product
exports.myRating = async (req, res) => {
  try {
    const rating = await prisma.rating.findUnique({
      where: {
        productId_customerId: {
          productId: parseInt(req.params.productId),
          customerId: req.customerId
        }
      }
    });
    res.json(rating || null);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Average stars for all products (for ProductCard display)
exports.summary = async (req, res) => {
  try {
    const grouped = await prisma.rating.groupBy({
      by: ['productId'],
      _avg: { stars: true },
      _count: { stars: true }
    });
    const map = {};
    for (const g of grouped) {
      map[g.productId] = {
        average: g._avg.stars || 0,
        count: g._count.stars || 0
      };
    }
    res.json(map);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};