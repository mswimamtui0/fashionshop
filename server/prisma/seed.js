const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.customer.upsert({
    where: { phone: process.env.ADMIN_PHONE || '255712345678' },
    update: {},
    create: {
      name: 'Admin',
      phone: process.env.ADMIN_PHONE || '255712345678',
      email: 'admin@yourshop.com',
      password: hashed,
      consentSMS: true
    }
  });

  console.log('✅ Admin user created');
  console.log('   Phone: ' + (process.env.ADMIN_PHONE || '255712345678'));
  console.log('   Password: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());