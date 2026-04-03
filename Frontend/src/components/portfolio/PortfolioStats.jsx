import {
  Activity,
  CircleDollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

const formatMoney = (value, currency = "USD") => {
  const numericValue = Number(value ?? 0);
  const normalizedCurrency = currency === "USDT" ? "USD" : currency;
  const formattedValue = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numericValue);

  return `${normalizedCurrency} ${formattedValue}`;
};

const formatPercent = (value) => {
  const numericValue = Number(value ?? 0);
  const sign = numericValue > 0 ? "+" : "";
  return `${sign}${numericValue.toFixed(2)}%`;
};

const statCards = [
  {
    key: "balance",
    label: "Balance",
    icon: Wallet,
    color: "text-blue-300",
  },
  {
    key: "initialValue",
    label: "Initial Value",
    icon: CircleDollarSign,
    color: "text-sky-300",
  },
  {
    key: "portfolioPnL",
    label: "Portfolio PnL",
    icon: TrendingUp,
    color: "text-violet-300",
    isPercent: true,
  },
  {
    key: "winRate",
    label: "Win Rate",
    icon: Activity,
    color: "text-pink-300",
    isPercent: true,
  },
];

const PortfolioStats = ({ portfolio, winRate, portfolioPnL }) => {
  return (
    <div className="px-4 pt-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Portfolio Statistics
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {statCards.map(({ key, label, icon: Icon, color, isPercent, isCount }) => {
          const rawValue =
            key === "winRate"
              ? winRate
              : key === "portfolioPnL"
                ? portfolioPnL
                : portfolio[key];
          const displayValue = isPercent
            ? formatPercent(rawValue)
            : isCount
              ? Number(rawValue ?? 0)
              : formatMoney(rawValue, portfolio.currency);
          const valueTone =
            key === "portfolioPnL"
              ? Number(rawValue ?? 0) > 0
                ? "text-emerald-400"
                : "text-rose-400"
              : isPercent && Number(rawValue ?? 0) < 0
                ? "text-rose-400"
                : "text-white";

          return (
            <div
              key={key}
              className="rounded-2xl border border-white/10 bg-[#161b22] p-4 shadow-sm shadow-black/20"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-400">{label}</p>
                <Icon size={18} className={color} />
              </div>

              <p className={`mt-3 text-xl font-semibold ${valueTone}`}>
                {displayValue}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioStats;
