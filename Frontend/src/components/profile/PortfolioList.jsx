const PortfolioList = ({ portfolio }) => {
  if (!portfolio) {
    return (
      <div className="text-gray-400 text-center mt-6">No portfolio found</div>
    );
  }

  const balance = parseFloat(portfolio.balance);
  const initial = parseFloat(portfolio.initialValue);

  const pnl =
    initial > 0 ? (((balance - initial) / initial) * 100).toFixed(2) : 0;

  const isProfit = pnl >= 0;

  return (
    <div className="mt-4 p-4 rounded-xl bg-[#161b22] border border-gray-800">
      {/* 🔝 Top Row */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{portfolio.name}</h3>

        {/* 🔥 PnL */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">PnL:</span>

          <p
            className={`font-semibold ${
              isProfit ? "text-green-400" : "text-red-400"
            }`}
          >
            {isProfit ? "+" : ""}
            {pnl}%
          </p>
        </div>
      </div>

      {/* 📊 Values */}
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-400">Balance</p>
          <p className="text-white">${balance.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-gray-400">Initial</p>
          <p className="text-white">${initial.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioList;
