const TradeCard = () => {
  const trade = {
    pair: "BTC/USDT",
    type: "Long",
    entry: 67200,
    leverage: "2x",
    pnlPercent: "+12.4%",
    pnlValue: "$75,540",
    takeProfit: "$80,000",
    stopLoss: "$64,000",
    size: "15%",
    riskReward: "2.5",
    status: "open", // "open" or "closed"
    closedAt: "2 Mar 2026",
  };

  const statusColor =
    trade.status === "open" ? "bg-green-500" : "bg-orange-500";
  return (
    <a href="/posts/:postId">
      <div className="mt-3 p-4 rounded-xl shadow-sm shadow-black/20 space-y-3 bg-gray-800">
        {/* TOP SECTION */}
        <div className="flex justify-between items-start">
          {/* LEFT */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-lg">{trade.pair}</h2>

              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-400">
                {trade.type}
              </span>
            </div>

            <p className="text-gray-400 text-sm mt-1">
              ${trade.entry.toLocaleString()} • {trade.leverage}
            </p>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <p className="text-green-400 font-semibold">{trade.pnlPercent}</p>
            <p className="text-white font-semibold">{trade.pnlValue}</p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-800"></div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Take Profit</p>
            <p className="text-green-400 font-medium">{trade.takeProfit}</p>
          </div>

          <div>
            <p className="text-gray-400">Stop Loss</p>
            <p className="text-red-400 font-medium">{trade.stopLoss}</p>
          </div>

          <div>
            <p className="text-gray-400">Size</p>
            <p className="text-white font-medium">{trade.size}</p>
          </div>

          <div>
            <p className="text-gray-400">R:R</p>
            <p className="text-white font-medium">{trade.riskReward}</p>
          </div>
        </div>

        <div className="mt-3 px-3 py-2 rounded-lg bg-[#121212] flex justify-between items-center shadow-inner shadow-black/20">
          {/* LEFT: STATUS */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
            <span className="text-sm text-gray-300">
              {trade.status === "open" ? "New Position" : "Closed Position"}
            </span>
          </div>

          {/* RIGHT: DATE */}
          <span className="text-sm text-gray-500">
            {trade.status === "open" ? "Live" : `Closed ${trade.closedAt}`}
          </span>
        </div>
      </div>
    </a>
  );
};

export default TradeCard;
