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

async function init() {
  const coins = await prisma.coin.findMany({
    select: { symbol: true },
  });

  const symbols = coins.map((c) => `${c.symbol}USDT`);

  startPriceStream(symbols);
  startTradeEngine();
}
init();
const PORT = process.env.PORT || 3000;

setupPriceBroadcastServer(server);

server.listen(PORT, () => {
  console.log(`Tradr server running on port ${PORT}`);
});
