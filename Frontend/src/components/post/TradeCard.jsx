import { useLivePriceStore } from "../../store/livePriceStore";

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
    maximumFractionDigits: 4,
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

  const prices = useLivePriceStore((state) => state.prices);
  const liveSymbol = trade.coinSymbol ? `${trade.coinSymbol}USDT` : null;
  const liveCurrentPrice =
    trade.status === "open" && liveSymbol ? prices[liveSymbol] : null;
  const currentPrice = liveCurrentPrice ?? trade.currentPrice;

  let profitLoss = null;
  let priceChange = null;
  if (trade.entryPrice && currentPrice) {
    const entry = Number(trade.entryPrice);
    const current = Number(currentPrice);

    if (trade.tradeType === "long") {
      priceChange = (current - entry) / entry;
    } else if (trade.tradeType === "short") {
      priceChange = (entry - current) / entry;
    }
  }

  profitLoss = priceChange * trade.leverage * 100;
  const pair = trade.coinSymbol
    ? `${trade.coinSymbol}/USDT`
    : trade.coinName || "Trade";
  const direction = trade.tradeType || "Trade";
  const status = trade.status?.toLowerCase() || "open";
  const statusColor = status === "open" ? "bg-emerald-500" : "bg-red-400";
  const pnlColor =
    trade.status === "closed"
      ? Number(trade.profitLoss) >= 0
        ? "text-emerald-400"
        : "text-rose-400"
      : Number(profitLoss) >= 0
        ? "text-emerald-400"
        : "text-rose-400";
  const directionTone =
    direction === "long"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-rose-500/15 text-rose-300";
  const positionSize =
    trade.positionSize !== null && trade.positionSize !== undefined
      ? `${trade.positionSize}%`
      : "--";
  const statusDateLabel = status === "open" ? "Opened " : "Closed ";
  const statusDateValue =
    status === "open" ? trade.createdAt : trade.closedAt || trade.createdAt;

  const priceColor = trade.status === "closed" ? "text-gray-400" : "text-white";
  
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 shadow-sm shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{pair}</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${directionTone}`}
            >
              {direction.charAt(0).toUpperCase() + direction.slice(1)}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            {formatCurrency(trade.entryPrice)}
            {` • ${trade.leverage}x leverage`}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-[1.6rem] font-semibold leading-none ${pnlColor}`}>
            {trade.status === "closed"
              ? formatProfitLoss(trade.profitLoss)
              : formatProfitLoss(profitLoss)}
          </p>
          <p className={`mt-1 text-sm ${priceColor}`}>
            {trade.status === "closed"
              ? formatCurrency(trade.exitPrice)
              : formatCurrency(currentPrice)}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-white/8 pt-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-5">
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

          <div>
            <p className="text-gray-400">Coin</p>
            <p className="mt-1 font-semibold text-white">
              {trade.coinName || trade.coinSymbol || "--"}
            </p>
          </div>
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
          {statusDateValue && (
            <span>
              {statusDateLabel}{" "}
              {new Date(statusDateValue).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeCard;
