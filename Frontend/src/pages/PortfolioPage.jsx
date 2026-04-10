import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { fetchPortfolioTrades } from "../api/profileApi";
import PortfolioPageHeader from "../components/portfolio/PortfolioPageHeader";
import PortfolioStats from "../components/portfolio/PortfolioStats";
import PortfolioTradeTabs from "../components/portfolio/PortfolioTradeTabs";
import PortfolioTradesSection from "../components/portfolio/PortfolioTradesSection";
import { useAuth } from "../context/AuthContext";

const fetchAllTradesByStatus = async (portfolioId, status) => {
  const allTrades = [];
  let currentPage = 1;
  let latestPortfolio = null;
  let latestPagination = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await fetchPortfolioTrades(portfolioId, {
      status,
      page: currentPage,
    });

    latestPortfolio = res?.data?.portfolio ?? latestPortfolio;
    latestPagination = res?.data?.pagination ?? latestPagination;
    allTrades.push(...(res?.data?.trades ?? []));

    hasNextPage = Boolean(res?.data?.pagination?.hasNextPage);
    currentPage += 1;
  }

  return {
    portfolio: latestPortfolio,
    trades: allTrades,
    pagination: latestPagination,
  };
};

const PortfolioPage = () => {
  const { user: currentUser } = useAuth();
  const { portfolioId } = useParams();
  const location = useLocation();

  const portfolioFromState = location.state?.portfolio ?? null;
  const [portfolio, setPortfolio] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [tradesByStatus, setTradesByStatus] = useState({
    open: [],
    closed: [],
  });
  const [tradesLoading, setTradesLoading] = useState(true);
  const [tradesError, setTradesError] = useState(null);
  const [tradeCounts, setTradeCounts] = useState({
    open: 0,
    closed: 0,
  });

  useEffect(() => {
    const loadTrades = async () => {
      try {
        setTradesLoading(true);
        setTradesError(null);

        const [openTradesRes, closedTradesRes] = await Promise.all([
          fetchAllTradesByStatus(portfolioId, "open"),
          fetchAllTradesByStatus(portfolioId, "closed"),
        ]);

        const resolvedPortfolio =
          openTradesRes.portfolio ??
          closedTradesRes.portfolio ??
          portfolioFromState;

        const openTrades = openTradesRes.trades ?? [];
        const closedTrades = closedTradesRes.trades ?? [];

        setPortfolio((currentPortfolio) => ({
          ...portfolioFromState,
          ...currentPortfolio,
          ...resolvedPortfolio,
        }));
        setTradesByStatus({
          open: openTrades,
          closed: closedTrades,
        });
        setTradeCounts({
          open: openTradesRes?.pagination?.total ?? openTrades.length,
          closed: closedTradesRes?.pagination?.total ?? closedTrades.length,
        });
      } catch {
        setTradesError("Failed to load trades");
        setTradesByStatus({ open: [], closed: [] });
        setTradeCounts({ open: 0, closed: 0 });
      } finally {
        setTradesLoading(false);
      }
    };

    loadTrades();
  }, [portfolioId, portfolioFromState]);

  const winRate = useMemo(() => {
    const closedTrades = tradesByStatus.closed ?? [];

    if (!closedTrades.length) {
      return 0;
    }

    const winningTrades = closedTrades.filter(
      (trade) => Number(trade.profitLoss ?? 0) > 0,
    ).length;

    return (winningTrades / closedTrades.length) * 100;
  }, [tradesByStatus.closed]);

  const portfolioPnL = useMemo(() => {
    const initialValue = Number(portfolio?.initialValue ?? 0);
    const balance = Number(portfolio?.balance ?? 0);

    if (!initialValue) {
      return 0;
    }

    return ((balance - initialValue) / initialValue) * 100;
  }, [portfolio]);

  if (tradesLoading && !portfolio) {
    return (
      <div className="animate-pulse px-4">
        <div className="mb-4 h-20 rounded-lg bg-gray-800"></div>
        <div className="mb-3 h-32 rounded bg-gray-800"></div>
        <div className="h-40 rounded bg-gray-800"></div>
      </div>
    );
  }

  const username = portfolio?.user?.username;
  console.log(portfolio);

  if (tradesError || !portfolio) {
    return (
      <div className="mt-10 text-center text-red-400">
        {tradesError || "Portfolio not found"}
      </div>
    );
  }

  const activeTrades = tradesByStatus[activeTab] ?? [];
  const openCount = tradeCounts.open;
  const closedCount = tradeCounts.closed;
  const canCreateTrade = Boolean(
    currentUser?.username &&
    username &&
    currentUser.username.toLowerCase() === username.toLowerCase(),
  );

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[750px]">
        <PortfolioPageHeader
          username={username}
          portfolioName={portfolio.name}
        />
        {canCreateTrade && (
          <div className="px-4 pt-5">
            <Link
              to="/create-trade"
              state={{ portfolio, source: "portfolio-page" }}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-3 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <PlusCircle size={16} />
              Create Trade
            </Link>
          </div>
        )}
        <PortfolioStats
          portfolio={portfolio}
          winRate={winRate}
          portfolioPnL={portfolioPnL}
        />
        <PortfolioTradeTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openCount={openCount}
          closedCount={closedCount}
        />
        <PortfolioTradesSection
          trades={activeTrades}
          activeTab={activeTab}
          loading={tradesLoading}
          error={tradesError}
          canCreateTrade={canCreateTrade}
          portfolio={portfolio}
        />
      </div>
    </div>
  );
};

export default PortfolioPage;
