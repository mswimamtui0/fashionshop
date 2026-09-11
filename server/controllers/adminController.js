const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.dashboard = async (req, res) => {
  try {
    const [totalCustomers, totalProducts, totalOrders, topViewed] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.product.findMany({ orderBy: { views: 'desc' }, take: 10 })
    ]);

    const revenue = await prisma.order.aggregate({ _sum: { total: true } });

    res.json({
      totalCustomers,
      totalProducts,
      totalOrders,
      revenue: revenue._sum.total || 0,
      topViewed
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};