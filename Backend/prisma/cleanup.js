const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.trade.deleteMany({});
  await prisma.portfolio.deleteMany({});
  console.log('Trades and portfolios cleared.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());