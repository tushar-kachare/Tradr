import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { createPortfolio } from "../../api/profileApi";

const initialPortfolioForm = {
  name: "",
  initialValue: "",
  currency: "USDT",
};

const formatMoney = (value, currency = "USD") => {
  const numericValue = Number(value ?? 0);
  const normalizedCurrency = currency === "USDT" ? "USD" : currency;

  return `${normalizedCurrency} ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)}`;
};

const PortfolioList = ({
  portfolio,
  username,
  isOwner = false,
  onPortfolioCreated,
}) => {
  const [form, setForm] = useState(initialPortfolioForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!String(form.initialValue).trim()) {
      setError("Initial value is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPortfolio({
        name: form.name.trim() || undefined,
        initialValue: Number(form.initialValue),
        currency: form.currency.trim().toUpperCase() || "USDT",
      });
      setForm(initialPortfolioForm);
      await onPortfolioCreated?.();
    } catch (submitError) {
      setError(
        submitError.response?.data?.message || "Failed to create portfolio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!portfolio) {
    if (!isOwner) {
      return (
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#161b22] px-6 py-10 text-center text-gray-400">
          No portfolio found
        </div>
      );
    }

    return (
      <div className="mt-6 max-w-xl rounded-xl border border-white/10 bg-[#0b0f14] text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-gray-300">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <h3 className="text-sm font-medium">Create portfolio</h3>
            <p className="text-xs text-gray-400">
              Set your base capital and currency
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="px-5 py-5 space-y-5" onSubmit={handleSubmit}>
          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Portfolio name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="My Portfolio"
                className="w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2 text-sm outline-none focus:border-white/20"
              />
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Initial value</label>
              <input
                name="initialValue"
                type="number"
                min="1"
                step="0.01"
                value={form.initialValue}
                onChange={handleChange}
                placeholder="10000"
                className="w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2 text-sm outline-none focus:border-white/20"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5 max-w-[180px]">
            <label className="text-xs text-gray-400">Currency</label>
            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              placeholder="USDT"
              className="w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2 text-sm uppercase outline-none focus:border-white/20"
            />
          </div>

          {/* Error */}
          {error && <div className="text-xs text-red-400">{error}</div>}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">Default currency is USDT</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? "Creating" : "Create"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const balance = parseFloat(portfolio.balance);
  const initial = parseFloat(portfolio.initialValue);
  const pnl =
    initial > 0 ? (((balance - initial) / initial) * 100).toFixed(2) : 0;
  const isProfit = Number(pnl) >= 0;

  return (
    <Link to={`/portfolio/${portfolio.id}`}>
      <div className="mt-4 rounded-[26px] border border-white/10 bg-[#161b22] p-5 text-white shadow-lg shadow-black/15">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h3 className="mt-2 text-xl font-semibold">{portfolio.name}</h3>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
            <span className="text-gray-400">PnL</span>
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            <p className="text-gray-400">Balance</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatMoney(balance, portfolio.currency)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            <p className="text-gray-400">Initial</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatMoney(initial, portfolio.currency)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {isOwner && (
            <Link
              to="/create-trade"
              state={{
                portfolio,
                source: "portfolio-list",
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <PlusCircle size={16} />
              Create Trade
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PortfolioList;
