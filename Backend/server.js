require("dotenv").config();
const app = require("./src/app");
const prisma = require("./src/config/db");

const { startPriceStream } = require("./src/services/price.service");
const { startTradeEngine } = require("./src/services/tradeEngine.service");

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

app.listen(PORT, () => {
  console.log(`Tradr server running on port ${PORT}`);
});
