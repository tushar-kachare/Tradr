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
  { symbol: "USDC", name: "USD Coin", slug: "usd-coin" },
  { symbol: "LTC", name: "Litecoin", slug: "litecoin" },
  { symbol: "BCH", name: "Bitcoin Cash", slug: "bitcoin-cash" },
  { symbol: "UNI", name: "Uniswap", slug: "uniswap" },
  { symbol: "ATOM", name: "Cosmos", slug: "cosmos" },
  { symbol: "NEAR", name: "NEAR Protocol", slug: "near-protocol" },
  { symbol: "ICP", name: "Internet Computer", slug: "internet-computer" },
  { symbol: "FIL", name: "Filecoin", slug: "filecoin" },
  { symbol: "ARB", name: "Arbitrum", slug: "arbitrum" },
  { symbol: "OP", name: "Optimism", slug: "optimism" },
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
