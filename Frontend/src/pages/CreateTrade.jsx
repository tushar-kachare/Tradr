import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CircleAlert,
  Loader2,
  Radio,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { createTrade } from "../api/tradeApi";
import { shareTradePost } from "../api/postActions";
import { fetchMyPortfolio } from "../api/profileApi";
import { useLivePriceStore } from "../store/livePriceStore";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  coin: "BTC",
  tradeType: "long",
  positionSize: "10",
  leverage: "1",
  targetPrice: "",
  stopLoss: "",
  holdTime: "",
  strategy: "",
};

const formatMoney = (value, currency = "USD") => {
  const numericValue = Number(value ?? 0);
  const normalizedCurrency = currency === "USDT" ? "USD" : currency;

  return `${normalizedCurrency} ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)}`;
};

const CreateTrade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const preselectedPortfolio = location.state?.portfolio ?? null;

  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sharePublicly, setSharePublicly] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [portfolio, setPortfolio] = useState(preselectedPortfolio);
  const [selectedPortfolio, setSelectedPortfolio] =
    useState(preselectedPortfolio);
  const [portfolioLoading, setPortfolioLoading] =
    useState(!preselectedPortfolio);
  const [portfolioError, setPortfolioError] = useState("");

  const prices = useLivePriceStore((state) => state.prices);
  const connectionStatus = useLivePriceStore((state) => state.connectionStatus);
  const lastUpdatedAt = useLivePriceStore((state) => state.lastUpdatedAt);

  const normalizedCoin = form.coin.trim().toUpperCase();
  const tradeSymbol = normalizedCoin ? `${normalizedCoin}USDT` : "";
  const livePrice = tradeSymbol ? prices[tradeSymbol] : null;
  const selectedCurrency =
    selectedPortfolio?.currency || portfolio?.currency || "USDT";
  const selectedBalance = Number(
    selectedPortfolio?.balance ?? portfolio?.balance ?? 0,
  );
  const selectedAvailableValue = Number(
    selectedPortfolio?.availableValue ??
      portfolio?.availableValue ??
      selectedBalance,
  );
  const requestedAmount =
    selectedBalance > 0
      ? (Number(form.positionSize || 0) / 100) * selectedBalance
      : 0;

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setPortfolioLoading(true);
        setPortfolioError("");
        const response = await fetchMyPortfolio();
        const fetchedPortfolio = response?.data ?? null;

        setPortfolio(fetchedPortfolio);
        setSelectedPortfolio((currentSelectedPortfolio) =>
          currentSelectedPortfolio?.id === fetchedPortfolio?.id
            ? fetchedPortfolio
            : currentSelectedPortfolio,
        );
      } catch (loadError) {
        if (loadError.response?.status === 404) {
          setPortfolio(null);
          setSelectedPortfolio(null);
        } else {
          setPortfolioError(
            loadError.response?.data?.message ||
              "Failed to load your portfolio.",
          );
        }
      } finally {
        setPortfolioLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "coin" ? value.toUpperCase() : value,
    }));
  };

  const handleSelectPortfolio = () => {
    if (!portfolio) {
      return;
    }

    setSelectedPortfolio(portfolio);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedPortfolio) {
      setError("Select a portfolio before creating a trade.");
      return;
    }

    if (!normalizedCoin) {
      setError("Coin symbol is required.");
      return;
    }

    if (!livePrice) {
      setError(
        "Waiting for a live price for this coin. Try a streamed symbol.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const tradeResponse = await createTrade({
        ...form,
        coin: normalizedCoin,
      });

      const createdTradeId = tradeResponse.data?.trade?.id;

      if (sharePublicly) {
        if (!createdTradeId) {
          throw new Error(
            "Trade created, but trade id was missing for sharing.",
          );
        }

        await shareTradePost({
          content: shareContent.trim(),
          tradeId: createdTradeId,
        });
      }

      navigate(
        selectedPortfolio?.id ? `/portfolio/${selectedPortfolio.id}` : "/",
        {
          state: selectedPortfolio?.id
            ? {
                portfolio: selectedPortfolio,
                username: currentUser?.username,
              }
            : undefined,
        },
      );
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
          submitError.message ||
          "Failed to create trade.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTone =
    connectionStatus === "connected"
      ? "text-emerald-300"
      : connectionStatus === "connecting"
        ? "text-amber-300"
        : "text-rose-300";

  if (portfolioLoading && !portfolio && !selectedPortfolio) {
    return (
      <div className="mx-auto w-full max-w-4xl animate-pulse space-y-4">
        <div className="h-32 rounded-[28px] bg-[#151a22]" />
        <div className="h-72 rounded-[28px] bg-[#151a22]" />
      </div>
    );
  }

  if (portfolioError) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">
        {portfolioError}
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(160deg,#11161d,#090c11)] text-white shadow-2xl">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xs uppercase tracking-[0.34em] text-emerald-300/80">
            Create Trade
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            You need a portfolio first
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Trades are created inside your portfolio so we can track allocation,
            balance, and performance correctly.
          </p>
        </div>

        <div className="px-6 py-8">
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <BriefcaseBusiness size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Set up your portfolio</h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Create it from your profile page, then come back here to pick
                  it and open a trade.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={
                  currentUser?.username
                    ? `/profile/${currentUser.username}`
                    : "/"
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Go To Profile
              </Link>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/5"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPortfolio) {
    const initialValue = Number(portfolio.initialValue ?? 0);
    const balance = Number(portfolio.balance ?? 0);

    const pnlPercent = initialValue
      ? ((balance - initialValue) / initialValue) * 100
      : 0;
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-[#0f1419] p-6 text-white">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Select Portfolio</h1>
        </div>

        {/* Portfolio Card */}
        <div className="rounded-xl bg-white/5 p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{portfolio.name}</h2>
              <p className="text-sm text-gray-400">
                {formatMoney(portfolio.balance, portfolio.currency)}
              </p>
            </div>

            <div
              className={`text-sm font-semibold px-2 py-1 rounded-md ${
                pnlPercent >= 0
                  ? "text-green-400 bg-green-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}
            >
              {pnlPercent >= 0 ? "+" : ""}
              {pnlPercent.toFixed(2)}%
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Available</p>
              <p className="font-semibold">
                {formatMoney(portfolio.availableValue, portfolio.currency)}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Allocated</p>
              <p className="font-semibold">
                {formatMoney(portfolio.allocatedValue, portfolio.currency)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSelectPortfolio}
              className="flex-1 rounded-lg bg-cyan-400 py-2 text-sm font-medium text-black hover:bg-cyan-300"
            >
              Use Portfolio
            </button>

            <Link
              to={`/portfolio/${portfolio.id}`}
              state={{ username: currentUser?.username }}
              className="flex-1 text-center rounded-lg bg-white/5 py-2 text-sm hover:bg-white/10"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl text-white">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="mt-3 text-xl font-semibold">Create Trade</h1>
        <p className="text-sm text-gray-400">{selectedPortfolio.name}</p>
      </div>

      {/* Live + Balance */}
      <div className="mb-6 flex justify-between rounded-xl bg-white/5 p-4 text-sm">
        <div>
          <p className="text-gray-400">Live Price</p>
          <p className="font-semibold">
            {livePrice ? `$${livePrice.toLocaleString()}` : "--"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Available</p>
          <p className="font-semibold">
            {formatMoney(selectedAvailableValue, selectedCurrency)}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Inputs */}
        <input
          name="coin"
          value={form.coin}
          onChange={handleChange}
          placeholder="Coin (BTC)"
          className="w-full rounded-lg bg-white/5 px-4 py-3 outline-none focus:ring-1 focus:ring-cyan-400"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="positionSize"
            type="number"
            value={form.positionSize}
            onChange={handleChange}
            placeholder="Size %"
            className="rounded-lg bg-white/5 px-4 py-3 outline-none"
          />

          <input
            name="leverage"
            type="number"
            value={form.leverage}
            onChange={handleChange}
            placeholder="Leverage"
            className="rounded-lg bg-white/5 px-4 py-3 outline-none"
          />
        </div>

        {/* Long / Short */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm((c) => ({ ...c, tradeType: "long" }))}
            className={`flex-1 py-2 rounded-lg ${
              form.tradeType === "long"
                ? "bg-green-500 text-black"
                : "bg-white/5"
            }`}
          >
            Long
          </button>

          <button
            type="button"
            onClick={() => setForm((c) => ({ ...c, tradeType: "short" }))}
            className={`flex-1 py-2 rounded-lg ${
              form.tradeType === "short"
                ? "bg-red-500 text-black"
                : "bg-white/5"
            }`}
          >
            Short
          </button>
        </div>

        {/* Optional Risk */}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="targetPrice"
            value={form.targetPrice}
            onChange={handleChange}
            placeholder="Target (optional)"
            className="rounded-lg bg-white/5 px-4 py-3 outline-none"
          />

          <input
            name="stopLoss"
            value={form.stopLoss}
            onChange={handleChange}
            placeholder="Stop Loss"
            className="rounded-lg bg-white/5 px-4 py-3 outline-none"
          />
        </div>

        {/* Strategy (optional) */}
        <textarea
          name="strategy"
          value={form.strategy}
          onChange={handleChange}
          placeholder="Strategy (optional)"
          className="w-full rounded-lg bg-white/5 px-4 py-3 outline-none"
        />

        {/* Error */}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg bg-white/5 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !livePrice}
            className="flex-1 rounded-lg bg-cyan-400 py-2 text-sm text-black"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrade;
