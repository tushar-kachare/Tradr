require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const prisma = require("./src/config/db");

const {
  setupPriceBroadcastServer,
  startPriceStream,
} = require("./src/services/price.service");
const { startTradeEngine } = require("./src/services/tradeEngine.service");

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

async function init() {
  const coins = await prisma.coin.findMany({
    select: { symbol: true },
  });

  const symbols = coins.map((c) => `${c.symbol}USDT`);

  startPriceStream(symbols);
  startTradeEngine();

  server.listen(PORT, () => {
    console.log(`Tradr server running on port ${PORT}`);
  });
}

init().catch((error) => {
  console.error("Failed to start Tradr server:", error);
  process.exit(1);
});
setupPriceBroadcastServer(server);
