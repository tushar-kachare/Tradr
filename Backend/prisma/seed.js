const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const coins = [
  { symbol: "BTC", name: "Bitcoin", slug: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", slug: "ethereum" },
  { symbol: "SOL", name: "Solana", slug: "solana" },
  { symbol: "BNB", name: "BNB", slug: "bnb" },
  { symbol: "XRP", name: "XRP", slug: "xrp" },
  { symbol: "DOGE", name: "Dogecoin", slug: "dogecoin" },
  { symbol: "ADA", name: "Cardano", slug: "cardano" },
  { symbol: "AVAX", name: "Avalanche", slug: "avalanche" },
  { symbol: "LINK", name: "Chainlink", slug: "chainlink" },
  { symbol: "DOT", name: "Polkadot", slug: "polkadot" },
  // add more as needed
];

async function main() {
  for (const coin of coins) {
    await prisma.coin.upsert({
      where: { symbol: coin.symbol },
      update: {},
      create: coin,
    });
  }
  console.log("Coins seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
