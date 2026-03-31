import { create } from "zustand";

let socket = null;
let reconnectTimer = null;
let manualDisconnect = false;

const getSocketUrl = () => {
  if (import.meta.env.VITE_PRICE_WS_URL) {
    return import.meta.env.VITE_PRICE_WS_URL;
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const normalizedHttpUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  if (normalizedHttpUrl.startsWith("https://")) {
    return `${normalizedHttpUrl.replace("https://", "wss://")}/ws/prices`;
  }

  return `${normalizedHttpUrl.replace("http://", "ws://")}/ws/prices`;
};

export const useLivePriceStore = create((set, get) => ({
  prices: {},
  connectionStatus: "idle",
  lastUpdatedAt: null,
  error: null,

  connect: () => {
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    manualDisconnect = false;
    set({ connectionStatus: "connecting", error: null });

    socket = new WebSocket(getSocketUrl());

    socket.onopen = () => {
      set({ connectionStatus: "connected", error: null });
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "prices:snapshot") {
          set({
            prices: payload.data || {},
            lastUpdatedAt: new Date().toISOString(),
          });
          return;
        }

        if (payload.type === "price:update") {
          const { symbol, price, updatedAt } = payload.data || {};

          if (!symbol || typeof price !== "number") {
            return;
          }

          set((state) => ({
            prices: {
              ...state.prices,
              [symbol]: price,
            },
            lastUpdatedAt: updatedAt || new Date().toISOString(),
          }));
        }
      } catch (error) {
        set({ error: "Failed to parse live price update." });
      }
    };

    socket.onerror = () => {
      set({ error: "Live price connection error." });
    };

    socket.onclose = () => {
      socket = null;
      set({ connectionStatus: "disconnected" });

      if (manualDisconnect) {
        return;
      }

      reconnectTimer = window.setTimeout(() => {
        get().connect();
      }, 3000);
    };
  },

  disconnect: () => {
    manualDisconnect = true;

    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (socket) {
      socket.close();
      socket = null;
    }

    set({ connectionStatus: "disconnected" });
  },
}));
