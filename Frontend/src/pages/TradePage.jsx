import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { closeTradeById, getTradeById, updateTradeById } from "../api/tradeApi";
import TradeCard from "../components/post/TradeCard";
import { useAuth } from "../context/AuthContext";

import {
  ArrowLeft,
  User,
  Pencil,
  X,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
const TradePage = () => {
  const { user: currentUser } = useAuth();
  const { tradeId } = useParams();
  const navigate = useNavigate();

  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false); // NEW
  const [editError, setEditError] = useState(null); // NEW — inline modal error
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        setLoading(true);
        const res = await getTradeById(tradeId);
        setTrade(res.trade);
        setEditForm({
          targetPrice: res.trade.targetPrice,
          stopLoss: res.trade.stopLoss,
          strategy: res.trade.strategy ?? "",
          holdTime: res.trade.holdTime ?? "", // ADD
        });
      } catch (err) {
        setError("Failed to load trade.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
  }, [tradeId]);

  const validateEditForm = () => {
    const { targetPrice, stopLoss, strategy } = editForm;

    const hasAtLeastOne =
      String(targetPrice).trim() ||
      String(stopLoss).trim() ||
      String(strategy).trim() ||
      String(holdTime).trim();

    if (!hasAtLeastOne) {
      return "Please update at least one field.";
    }

    const entry = parseFloat(trade.entryPrice);

    if (targetPrice && !isNaN(parseFloat(targetPrice))) {
      const tp = parseFloat(targetPrice);
      if (trade.tradeType === "long" && tp <= entry) {
        return "Take profit must be above entry price for a long trade.";
      }
      if (trade.tradeType === "short" && tp >= entry) {
        return "Take profit must be below entry price for a short trade.";
      }
    }

    return null;
  };

  const handleEdit = async () => {
    setEditError(null);

    // Client side validation
    const validateError = validateEditForm();
    if (validateError) {
      setEditError(validateError);
      return;
    }

    // Only send fields that have a value
    const payload = {};
    if (String(editForm.targetPrice).trim())
      payload.targetPrice = editForm.targetPrice;
    if (String(editForm.stopLoss).trim()) payload.stopLoss = editForm.stopLoss;
    if (String(editForm.strategy).trim()) payload.strategy = editForm.strategy;
    if (String(editForm.holdTime).trim()) payload.holdTime = editForm.holdTime;

    try {
      setSaving(true);
      console.log(payload);

      const res = await updateTradeById(tradeId, payload);

      setTrade(res.trade);
      setEditModal(false);
      toast.success("Trade updated!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Failed to update trade. Try again.";
      setEditError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    try {
      setClosing(true);
      const res = await closeTradeById(tradeId);
      setTrade(res.trade);
      setCloseModal(false);
      setCloseModal(false);
      toast.success("Position closed successfully!");
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    } finally {
      setClosing(false);
    }
  };

  const isOwner = trade?.userId === currentUser?.id;
  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-500">
        Loading trade...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center py-24 text-sm text-rose-400">
        {error}
      </div>
    );

  const { user, coin } = trade;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 mb-5"
      >
        <ArrowLeft size={25} />
      </button>

      {/* User info bar */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <User size={16} className="text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            @{user?.username ?? "unknown"}
          </p>
          <p className="text-xs text-gray-500">
            {trade.coinName} · {trade.tradingPair}
          </p>
        </div>
        <div className="ml-auto">
          {coin?.logoUrl ? (
            <img
              src={coin.logoUrl}
              alt={coin.name}
              className="h-8 w-8 rounded-full border border-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-violet-500/10 text-xs font-semibold text-violet-300">
              {trade.coinSymbol?.slice(0, 2)}
            </div>
          )}
        </div>
      </div>

      {/* Trade card */}
      <TradeCard trade={trade} />

      {/* Actions */}
      {trade.status === "open" && trade.userId === currentUser?.id && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setEditModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Pencil size={14} />
            Edit trade
          </button>
          <button
            onClick={() => setCloseModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <TrendingUp size={14} />
            Close position
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0e18] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Edit trade
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Update take profit, stop loss, or strategy
                </p>
              </div>
              <button
                onClick={() => setEditModal(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {[
              {
                label: "Take Profit",
                key: "targetPrice",
                placeholder: "e.g. 8.74",
                type: "number",
              },
              {
                label: "Stop Loss",
                key: "stopLoss",
                placeholder: "e.g. 8.64",
                type: "number",
              },
              {
                label: "Strategy",
                key: "strategy",
                placeholder: "e.g. Breakout",
                type: "text",
              },
              {
                label: "Hold Time",
                key: "holdTime",
                placeholder: "e.g. 2-3 weeks",
                type: "text",
              }, // ADD
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="mb-4">
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-gray-500">
                  {label}
                </label>
                <input
                  type={type}
                  value={editForm[key] ?? ""}
                  onChange={(e) => {
                    setEditError(null); // clear error on change
                    setEditForm((f) => ({ ...f, [key]: e.target.value }));
                  }}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-500/50 placeholder:text-gray-600"
                />
              </div>
            ))}

            {/* Inline error — shows both client + server errors */}
            {editError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5">
                <AlertTriangle
                  size={13}
                  className="mt-0.5 shrink-0 text-rose-400"
                />
                <p className="text-xs text-rose-300">{editError}</p>
              </div>
            )}

            <div className="mt-2 flex gap-3">
              <button
                onClick={() => setEditModal(false)}
                disabled={saving}
                className="flex-1 rounded-xl border border-white/8 bg-white/5 py-2.5 text-sm text-gray-400 hover:bg-white/8 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={saving}
                className="flex-1 rounded-xl border border-violet-500/25 bg-violet-500/15 py-2.5 text-sm font-medium text-violet-300 hover:bg-violet-500/20 transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0e18] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Close position
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Your trade will be closed at the current market price
                </p>
              </div>
              <button
                onClick={() => setCloseModal(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Trade summary */}
            <div className="mb-5 rounded-xl border border-white/6 bg-white/4 px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Pair</span>
                <span className="text-white font-medium">
                  {trade.tradingPair}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Entry price</span>
                <span className="text-white font-medium">
                  ${Number(trade.entryPrice).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Leverage</span>
                <span className="text-white font-medium">
                  {trade.leverage}x
                </span>
              </div>
            </div>

            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/8 px-4 py-3">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0 text-rose-400"
              />
              <p className="text-xs leading-relaxed text-rose-300">
                This will close your position at the live market price and lock
                in your final P&L. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCloseModal(false)}
                className="flex-1 rounded-xl border border-white/8 bg-white/5 py-2.5 text-sm text-gray-400 hover:bg-white/8 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={closing}
                className="flex-1 rounded-xl border border-rose-500/25 bg-rose-500/15 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/22 transition-colors disabled:opacity-40"
              >
                {closing ? "Closing..." : "Confirm close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradePage;
