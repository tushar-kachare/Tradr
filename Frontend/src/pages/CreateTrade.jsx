import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Radio, TrendingDown, TrendingUp } from "lucide-react";
import { createTrade } from "../api/tradeApi";
import { shareTradePost } from "../api/postActions";
import { useLivePriceStore } from "../store/livePriceStore";

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

const CreateTrade = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sharePublicly, setSharePublicly] = useState(false);
  const [shareContent, setShareContent] = useState("");

  const prices = useLivePriceStore((state) => state.prices);
  const connectionStatus = useLivePriceStore((state) => state.connectionStatus);
  const lastUpdatedAt = useLivePriceStore((state) => state.lastUpdatedAt);

  const normalizedCoin = form.coin.trim().toUpperCase();
  const tradeSymbol = normalizedCoin ? `${normalizedCoin}USDT` : "";
  const livePrice = tradeSymbol ? prices[tradeSymbol] : null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "coin" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!normalizedCoin) {
      setError("Coin symbol is required.");
      return;
    }

    if (!livePrice) {
      setError("Waiting for a live price for this coin. Try a streamed symbol.");
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
          throw new Error("Trade created, but trade id was missing for sharing.");
        }

        await shareTradePost({
          content: shareContent.trim(),
          tradeId: createdTradeId,
        });
      }

      navigate("/");
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
      ? "text-emerald-400"
      : connectionStatus === "connecting"
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-[#12161d] p-6 text-white shadow-2xl">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            Live Trade Desk
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Create a trade</h1>
          <p className="mt-2 text-sm text-gray-400">
            Submit with the latest streamed market price from the backend.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
          <div className={`flex items-center gap-2 ${statusTone}`}>
            <Radio size={14} />
            <span className="capitalize">{connectionStatus}</span>
          </div>
          <div className="mt-2 text-lg font-semibold">
            {livePrice ? `$${livePrice.toLocaleString()}` : "--"}
          </div>
          <div className="text-xs text-gray-500">
            {tradeSymbol || "Select a coin"}{" "}
            {lastUpdatedAt
              ? `• ${new Date(lastUpdatedAt).toLocaleTimeString("en-IN")}`
              : ""}
          </div>
        </div>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-gray-300">Coin Symbol</span>
            <input
              name="coin"
              value={form.coin}
              onChange={handleChange}
              placeholder="BTC"
              className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 uppercase outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Position Size (%)</span>
            <input
              name="positionSize"
              type="number"
              min="1"
              max="100"
              step="0.01"
              value={form.positionSize}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Leverage</span>
            <input
              name="leverage"
              type="number"
              min="1"
              max="10"
              value={form.leverage}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Hold Time</span>
            <input
              name="holdTime"
              value={form.holdTime}
              onChange={handleChange}
              placeholder="1D, 1W, scalp..."
              className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-gray-300">Target Price</span>
            <input
              name="targetPrice"
              type="number"
              step="0.0001"
              value={form.targetPrice}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-300">Stop Loss</span>
            <input
              name="stopLoss"
              type="number"
              step="0.0001"
              value={form.stopLoss}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-gray-300">Strategy</span>
          <textarea
            name="strategy"
            value={form.strategy}
            onChange={handleChange}
            rows={4}
            placeholder="Why are you taking this trade?"
            className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={sharePublicly}
              onChange={(event) => setSharePublicly(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0c1016]"
            />
            <div>
              <p className="text-sm font-medium text-white">
                Share publicly after trade creation
              </p>
              <p className="mt-1 text-sm text-gray-400">
                This will create a post linked to the new trade.
              </p>
            </div>
          </label>

          {sharePublicly && (
            <div className="mt-4">
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Post Content</span>
                <textarea
                  value={shareContent}
                  onChange={(event) => setShareContent(event.target.value)}
                  rows={4}
                  placeholder="Share your setup, thesis, or what you're watching..."
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1016] px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, tradeType: "long" }))}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 transition ${
              form.tradeType === "long"
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-black/20 text-gray-300"
            }`}
          >
            <TrendingUp size={18} />
            Long
          </button>

          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, tradeType: "short" }))}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 transition ${
              form.tradeType === "short"
                ? "border-rose-400 bg-rose-500/10 text-rose-300"
                : "border-white/10 bg-black/20 text-gray-300"
            }`}
          >
            <TrendingDown size={18} />
            Short
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-400">
            Entry price is read from the live stream on the backend when the trade is created.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !livePrice}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Trade"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTrade;
