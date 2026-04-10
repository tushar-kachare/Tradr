const prisma = require("../../config/db");

const getCoins = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const where = {
      isActive: true,
      ...(search
        ? {
            OR: [
              { symbol: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const coins = await prisma.coin.findMany({
      where,
      orderBy: [{ symbol: "asc" }],
      select: {
        id: true,
        symbol: true,
        name: true,
        slug: true,
        logoUrl: true,
      },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      coins,
    });
  } catch (error) {
    console.error("getCoins error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getCoins,
};
