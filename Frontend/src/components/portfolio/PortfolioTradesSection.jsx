import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext";
import TradeCard from "../post/TradeCard";

const PortfolioTradesSection = ({ trades, activeTab, loading, error }) => {
  const navigate = useNavigate();
  const {user} = useAuth();
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
          No {activeTab} trades found.
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
