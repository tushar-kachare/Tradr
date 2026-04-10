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
      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_30%),linear-gradient(145deg,#131923,#0b0f14)] text-white shadow-xl">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                Portfolio Setup
              </p>
              <h3 className="mt-1 text-2xl font-semibold">
                Create your trading base
              </h3>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300">
            You need a portfolio before logging trades. Set the benchmark value
            once, then every trade you create will use this portfolio for
            allocation.
          </p>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-gray-300">Portfolio Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="My Portfolio"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-gray-300">Initial Value</span>
              <input
                name="initialValue"
                type="number"
                min="1"
                step="0.01"
                value={form.initialValue}
                onChange={handleChange}
                placeholder="10000"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </label>
          </div>

          <label className="block max-w-[220px] space-y-2">
            <span className="text-sm text-gray-300">Currency</span>
            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              placeholder="USDT"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 uppercase outline-none transition focus:border-cyan-400"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400">
              Default currency is USDT, and your starting balance is set from
              the initial value.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Portfolio"}
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


          {isOwner && <Link
            to="/create-trade"
            state={{
              portfolio,
              source: "portfolio-list",
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <PlusCircle size={16} />
            Create Trade
          </Link>}
        </div>
      </div>
    </Link>
  );
};

export default PortfolioList;
