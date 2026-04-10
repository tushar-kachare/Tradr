import { Link, useNavigate } from "react-router-dom";
import TradeCard from "../post/TradeCard";

const PortfolioTradesSection = ({
  trades,
  activeTab,
  loading,
  error,
  canCreateTrade = false,
  portfolio = null,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
          Loading {activeTab} trades...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-8 text-center text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
          <p>No {activeTab} trades found.</p>
          {canCreateTrade && portfolio && activeTab === "open" && (
            <Link
              to="/create-trade"
              state={{ portfolio, source: "portfolio-empty-state" }}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Create your first trade
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {trades.map((trade) => (
          <TradeCard key={trade.id} trade={trade} onClick={() => navigate(`/trades/${trade.id}`)} />
      ))}
    </div>
  );
};

export default PortfolioTradesSection;
