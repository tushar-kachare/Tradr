const prisma = require("../../config/db");

const createPortfolio = async (req, res) => {
  try {
    const { name, initialValue, currency } = req.body;
    const userId = req.user.userId;

    // check if portfolio already exist;
    const existing = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Portfolio already exist.",
      });
    }

    // validate totalValue
    if (!initialValue || parseFloat(initialValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total value must be greater than 0",
      });
    }

    const startingValue = parseFloat(initialValue);

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: name || "My Portfolio",
        initialValue: startingValue, // fixed amount
        balance: startingValue, // updates on trade close
        currency: currency || "USDT",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      portfolio,
    });
  } catch (err) {
    console.error("createPortfolio error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.userId;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { trades: true },
        },
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Fetch open trades to compute allocated value
    const openTrades = await prisma.trade.findMany({
      where: {
        portfolioId: portfolio.id,
        status: "open",
        isDeleted: false,
      },
      select: { actualAmount: true },
    });

    const closedTradesCount = await prisma.trade.count({
      where: {
        portfolioId: portfolio.id,
        status: "closed",
        isDeleted: false,
      },
    });

    // Compute values
    const initialValue = parseFloat(portfolio.initialValue);
    const balance = parseFloat(portfolio.balance);

    // allocatedValue — sum of actualAmount of all open trades in $
    const allocatedValue = openTrades.reduce((sum, t) => {
      return sum + (t.actualAmount ? parseFloat(t.actualAmount) : 0);
    }, 0);

    const availableValue = balance - allocatedValue;

    // Portfolio P&L
    const portfolioPnL = parseFloat(
      (((balance - initialValue) / initialValue) * 100).toFixed(2),
    );

    return res.status(200).json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        currency: portfolio.currency,
        initialValue,
        balance,
        allocatedValue: parseFloat(allocatedValue.toFixed(2)),
        availableValue: parseFloat(availableValue.toFixed(2)),
        portfolioPnL,
        tradesCount: portfolio._count.trades,
        openTradesCount: openTrades.length,
        closedTradesCount,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      },
    });
  } catch (err) {
    console.error("getPortfolio error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, currency } = req.body;

    // check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found.",
      });
    }

    // build update data
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }
      updateData.name = name.trim();
    }

    if (currency !== undefined) {
      if (typeof currency !== "string" || currency.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Currency cannot be empty.",
        });
      }
      updateData.currency = currency.trim().toUpperCase();
    }

    // Nothing was sent to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update.",
      });
    }

    const updated = await prisma.portfolio.update({
      where: { userId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Portfolio updated successfully.",
      portfolio: updated,
    });
  } catch (err) {
    console.error("updatePortfolio error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getPortfolioTrades = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!portfolioId) {
      return res.status(400).json({
        success: false,
        message: "portfolioId is required",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number",
      });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50",
      });
    }

    const validStatuses = ["open", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'open' or 'closed",
      });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: {
        id: true,
        name: true,
        balance: true,
        initialValue: true,
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const where = {
      portfolioId,
      isDeleted: false,
      ...(status && { status }),
    };

    const skip = (pageNum - 1) * limitNum;

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          tradingPair: true,
          tradeType: true,
          status: true,
          entryPrice: true,
          exitPrice: true,
          positionSize: true,
          leverage: true,
          riskReward: true,
          holdTime: true,
          createdAt: true,
          closedAt: true,
        },
      }),
      prisma.trade.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        portfolio,
        trades,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    console.error("getPortfolioTrades error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  getPortfolioTrades,
};
