const prisma = require("../config/db");
const { getPrice } = require("./price.service");

const closeTradeService = async ({ tradeId, userId, isSystem = false }) => {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId, isDeleted: false },
  });

  if (!trade) {
    throw { message: "Trade not found", statusCode: 404 };
  }
  const exitPrice = getPrice(`${trade.coinSymbol}USDT`);
  // Validate exitPrice
  if (!exitPrice || isNaN(exitPrice)) {
    throw { message: "exitPrice is required", statusCode: 400 };
  }

  // find the trade;

  // check ownership
  if (!isSystem && userId && trade.userId !== userId) {
    throw { message: "Unauthorized", statusCode: 403 };
  }

  // cannot close 'close' or 'cancelled' trade
  if (trade.status !== "open") {
    throw { message: `Trade is already ${trade.status}`, statusCode: 400 };
  }

  const entryPrice = parseFloat(trade.entryPrice);
  const actualAmount = parseFloat(trade.actualAmount);
  const leverage = trade.leverage;

  let profitLoss;
  if (trade.tradeType === "long") {
    profitLoss = ((exitPrice - entryPrice) / entryPrice) * 100 * leverage;
  } else {
    profitLoss = ((entryPrice - exitPrice) / entryPrice) * 100 * leverage;
  }

  profitLoss = parseFloat(profitLoss.toFixed(2));

  const actualGain = actualAmount * (profitLoss / 100);

  // Fetch portfolio
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: trade.portfolioId },
  });

  if (!portfolio) {
    throw { message: "Portfolio not found", statusCode: 404 };
  }

  // Transaction — update trade and portfolio together
  const [updatedTrade, updatedPortfolio] = await prisma.$transaction([
    prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: "closed",
        exitPrice,
        profitLoss,
        closedAt: new Date(),
      },
      include: {
        coin: { select: { symbol: true, name: true, logoUrl: true } },
        user: { select: { username: true, avatarUrl: true } },
      },
    }),
    prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        balance: { increment: actualGain },
      },
    }),
  ]);

  return {
    trade: updatedTrade,
    summary: {
      entryPrice,
      exitPrice,
      profitLoss,
      actualGain: parseFloat(actualGain.toFixed(2)),
      newBalance: updatedPortfolio.balance,
    },
  };
};

module.exports = { closeTradeService };
