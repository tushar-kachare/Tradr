const prisma = require("../../config/db");
const createTrade = async (req, res) => {
  try {
    const userId = req.user.userId;
    let {
      coin,
      tradeType,
      entryPrice,
      targetPrice,
      stopLoss,
      positionSize,
      leverage = 1,
      holdTime,
      strategy,
      tradingPair,
    } = req.body;

    entryPrice = parseFloat(req.body.entryPrice);
    targetPrice = req.body.targetPrice
      ? parseFloat(req.body.targetPrice)
      : null;
    stopLoss = req.body.stopLoss ? parseFloat(req.body.stopLoss) : null;
    positionSize = parseFloat(req.body.positionSize);
    leverage = req.body.leverage ? parseInt(req.body.leverage) : 1;

    if (!coin || !tradeType || !entryPrice || !positionSize) {
      return res.status(400).json({
        success: false,
        message: "coin , tradeType , entryPrice, positionSize are required.",
      });
    }
    // Validate tradeType
    if (!["long", "short"].includes(tradeType)) {
      return res.status(400).json({
        success: false,
        message: "tradeType must be long or short",
      });
    }

    // Validate leverage
    if (leverage < 1 || leverage > 10) {
      return res.status(400).json({
        success: false,
        message: "leverage must be between 1 to 10.",
      });
    }

    // get the coin
    const coinRecord = await prisma.coin.findUnique({
      where: { symbol: coin.toUpperCase() },
    });

    if (!coinRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid coin symbol" });
    }

    // find Users portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found. Please create a portfolio first.",
      });
    }

    // ** Check the position size valid or not valid
    const balance = parseFloat(portfolio.balance);

    // Sum up positionSize of all open trades
    const openTrades = await prisma.trade.aggregate({
      where: { portfolioId: portfolio.id, status: "open", isDeleted: false },
      _sum: { actualAmount: true },
    });

    const allocatedValue = parseFloat(openTrades._sum.actualAmount || 0);
    const availableValue = balance - allocatedValue;
    const requestedAmount = (positionSize / 100) * balance;

    if (requestedAmount > availableValue) {
      return res.status(400).json({
        success: false,
        message: `Insufficient portfolio allocation. Required: $${requestedAmount.toFixed(2)}, Available: $${availableValue.toFixed(2)}`,
      });
    }

    const actualAmount = requestedAmount;

    // Get Risk and Reward if both stoploss and targetPrice are provided

    let riskReward = null;
    if (stopLoss && targetPrice) {
      const reward = Math.abs(targetPrice - entryPrice);
      const risk = Math.abs(entryPrice - stopLoss);
      if (risk == 0) {
        return res.status(400).json({
          success: false,
          message: "stopLoss cannot be equal to entryPrice.",
        });
      }

      riskReward = (reward / risk).toFixed(2);
    }

    const trade = await prisma.trade.create({
      data: {
        userId,
        portfolioId: portfolio.id,
        coinId: coinRecord.id,
        coinSymbol: coinRecord.symbol,
        coinName: coinRecord.name,
        tradingPair: tradingPair || `${coinRecord.symbol}/USDT`,
        tradeType,
        entryPrice,
        targetPrice,
        stopLoss: stopLoss || null,
        positionSize: positionSize || null,
        actualAmount,
        leverage,
        riskReward,
        holdTime: holdTime || null,
        strategy: strategy || null,
      },
      include: {
        coin: { select: { symbol: true, name: true, logoUrl: true } },
        user: {
          select: { username: true, avatarUrl: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Trade created successfully",
      trade,
    });
  } catch (err) {
    console.error("createTrade error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateTrade = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { targetPrice, stopLoss, holdTime, strategy } = req.body;

    // check if atleast one field is provided or not
    if (!targetPrice && !stopLoss && !holdTime && !strategy) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update.",
      });
    }

    const trade = await prisma.trade.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found.",
      });
    }

    // check ownership
    if (trade.userId != userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this trade.",
      });
    }

    // Cannot update a closed or cancelled trade
    if (trade.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${trade.status} trade.`,
      });
    }

    // Parse prices if provided
    const parsedTargetPrice = targetPrice ? parseFloat(targetPrice) : null;
    const parsedStopLoss = stopLoss ? parseFloat(stopLoss) : null;

    // Validate targetPrice against entryPrice
    if (parsedTargetPrice) {
      if (
        trade.tradeType === "long" &&
        parsedTargetPrice <= parseFloat(trade.entryPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "targetPrice must be above entryPrice for a long trade.",
        });
      }
      if (
        trade.tradeType === "short" &&
        parsedTargetPrice >= parseFloat(trade.entryPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "targetPrice must be below entryPrice for a short trade.",
        });
      }
    }

    // Recalculate riskReward if either targetPrice or stopLoss is updated
    let riskReward = trade.riskReward;
    const finalTargetPrice = parsedTargetPrice || parseFloat(trade.targetPrice);
    const finalStopLoss = parsedStopLoss || parseFloat(trade.stopLoss);

    if (finalTargetPrice && finalStopLoss) {
      const reward = Math.abs(finalTargetPrice - parseFloat(trade.entryPrice));
      const risk = Math.abs(parseFloat(trade.entryPrice) - finalStopLoss);
      if (risk > 0) {
        riskReward = (reward / risk).toFixed(2);
      }
    }

    // Build update object
    const updateData = {
      ...(parsedTargetPrice && { targetPrice: parsedTargetPrice }),
      ...(parsedStopLoss && { stopLoss: parsedStopLoss }),
      ...(holdTime && { holdTime }),
      ...(strategy && { strategy }),
      riskReward,
    };

    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: updateData,
      include: {
        coin: { select: { symbol: true, name: true, logoUrl: true } },
        user: { select: { username: true, avatarUrl: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Trade updated successfully.",
      trade: updatedTrade,
    });
  } catch (err) {
    console.error("updateTrade error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getTradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await prisma.trade.findUnique({
      where: { id, isDeleted: false },
      include: {
        coin: { select: { symbol: true, name: true, logoUrl: true } },
        user: { select: { username: true, avatarUrl: true } },
      },
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found.",
      });
    }
    return res.status(200).json({
      success: true,
      trade,
    });
  } catch (err) {
    console.error("getTradeById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const closeTrade = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const exitPrice = parseFloat(req.body.exitPrice);

    // Validate exitPrice
    if (!exitPrice || isNaN(exitPrice)) {
      return res.status(400).json({
        success: false,
        message: "exitPrice is required.",
      });
    }

    // find the trade;
    const trade = await prisma.trade.findUnique({
      where: { id, isDeleted: false },
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found.",
      });
    }

    // check ownership
    if (trade.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to close this trade.",
      });
    }

    // cannot close 'close' or 'cancelled' trade
    if (trade.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `Trade is already ${trade.status}.`,
      });
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
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    // Transaction — update trade and portfolio together
    const [updatedTrade] = await prisma.$transaction([
      prisma.trade.update({
        where: { id },
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
          balance: {increment: actualGain},
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Trade closed successfully.",
      trade: updatedTrade,
      summary: {
        entryPrice,
        exitPrice,
        profitLoss: `${profitLoss}%`,
        actualGain: parseFloat(actualGain.toFixed(2)),
        newPortfolioBalance: parseFloat(newBalance.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("closeTrade error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { createTrade, updateTrade, getTradeById, closeTrade };
