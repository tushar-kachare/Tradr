const WebSocket = require("ws");

let ws = null;

// In-memory price store
const prices = {};


const getPrice = (symbol) => {
  return prices[symbol.toUpperCase()] || null;
};


const getAllPrices = () => prices;

// Start WebSocket
const startPriceStream = (symbols = []) => {
  if (!symbols.length) {
    console.log("❌ No symbols provided to WebSocket");
    return;
  }

  // convert to lowercase for Binance
  const streams = symbols
    .map((s) => `${s.toLowerCase()}@ticker`)
    .join("/");

  const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  console.log("🚀 Connecting to Binance WS...");

  ws = new WebSocket(url);

  ws.on("open", () => {
    console.log("✅ Binance WebSocket connected");
  });

  ws.on("message", (data) => {
    try {
      const parsed = JSON.parse(data);
      const symbol = parsed.data.s; // BTCUSDT
      const price = parseFloat(parsed.data.c); // current price

      prices[symbol] = price;

      // DEBUG (remove in production)
      // console.log(symbol, price);
    } catch (err) {
      console.error("❌ Error parsing WS data:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("⚠️ WebSocket closed. Reconnecting...");
    setTimeout(() => startPriceStream(symbols), 5000); // auto reconnect
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
    ws.close();
  });
};

module.exports = {
  startPriceStream,
  getPrice,
  getAllPrices,
};