const prisma = require("../config/db");
const { getPrice } = require("./price.service");
const { closeTradeService } = require("./trade.service");

const startTradeEngine = () => {
  console.log("Trade engine started...");

  let isRuning = false; // prevent overlapping runs
  setInterval(async () => {
    if (isRuning) return;
    isRuning = true;

    try {
      const openTrades = await prisma.trade.findMany({
        where: { status: "open" },
      });

      for (let trade of openTrades) {
        const price = getPrice(`${trade.coinSymbol}USDT`);

        if (!price) continue;

        let shouldClose = false;
        let reason = "";

        // long trade
        if (trade.tradeType == "long") {
          if (trade.stopLoss && price <= trade.stopLoss) {
            ((shouldClose = true), (reason = "SL hit"));
          }
          if (trade.targetPrice && price >= trade.targetPrice) {
            shouldClose = true;
            reason = "TP hit";
          }
        }

        if (trade.tradeType == "short") {
          if (trade.stopLoss && price >= trade.stopLoss) {
            shouldClose = true;
            reason = "SL hit";
          }
          if (trade.targetPrice && price <= trade.targetPrice) {
            shouldClose = true;
            reason = "TP hit";
          }
        }

        if (shouldClose) {
          console.log(`closing trade ${trade.id} --> ${reason}`);
          await closeTradeService({
            tradeId: trade.id,
            isSystem: true,
          });
        }
      }
    } catch (err) {
      console.error("Trade Engine Error: ", err.message);
    } finally {
      isRuning = false;
    }
  }, 1000);
};

module.exports = {
  startTradeEngine,
};
