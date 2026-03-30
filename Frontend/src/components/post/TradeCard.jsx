const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const formatProfitLoss = (value) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value;
  }

  return `${numericValue > 0 ? "+" : ""}${numericValue.toFixed(2)}%`;
};

const TradeCard = ({ trade }) => {
  if (!trade) return null;

  const pair = trade.coinSymbol ? `${trade.coinSymbol}/USDT` : trade.coinName || "Trade";
  const direction = trade.tradeType || "Trade";
  const status = trade.status?.toLowerCase() || "open";
  const statusColor = status === "open" ? "bg-emerald-500" : "bg-amber-500";
  const pnlColor =
    Number(trade.profitLoss) >= 0 ? "text-emerald-400" : "text-rose-400";
  const positionSize =
    trade.positionSize !== null && trade.positionSize !== undefined
      ? `${trade.positionSize}%`
      : "--";

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-[#1b1b1b] p-5 shadow-sm shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{pair}</h2>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
              {direction.charAt(0).toUpperCase() + direction.slice(1)}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            {formatCurrency(trade.entryPrice)}
            {` • ${trade.leverage}x leverage`}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-[1.75rem] font-semibold leading-none ${pnlColor}`}>
            {formatProfitLoss(trade.profitLoss)}
          </p>
          <p className="text-sm text-gray-400">
            {formatCurrency(trade.currentPrice)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-white/8 pt-5">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-gray-400">Take Profit</p>
            <p className="mt-1 font-semibold text-emerald-400">
              {formatCurrency(trade.targetPrice)}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Stop Loss</p>
            <p className="mt-1 font-semibold text-rose-400">
              {formatCurrency(trade.stopLoss)}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Size</p>
            <p className="mt-1 font-semibold text-white">{positionSize}</p>
          </div>

          <div>
            <p className="text-gray-400">Hold Time</p>
            <p className="mt-1 font-semibold text-white">
              {trade.holdTime || "--"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-gray-400">Coin</p>
          <p className="mt-1 font-semibold text-white">
            {trade.coinName || trade.coinSymbol || "--"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Current</p>
          <p className="mt-1 font-semibold text-white">
            {formatCurrency(trade.currentPrice)}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Entry</p>
          <p className="mt-1 font-medium text-white">
            {formatCurrency(trade.entryPrice)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/25 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`}></span>
          <span className="text-sm text-gray-200">
            {status === "open" ? "Open position" : "Closed position"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
          {trade.closedAt && <span>Closed: {new Date(trade.closedAt).toLocaleDateString("en-IN")}</span>}
        </div>
      </div>
    </div>
  );
};

export default TradeCard;
