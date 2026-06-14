const WebSocket = require("ws");

let priceFeedSocket = null; // the Binance connection
let priceBroadcastServer = null; // my WS server for frontend clients
const broadcastClients = new Set(); // all currently connected frontend clients

// In-memory price store
const prices = {};

const getPrice = (symbol) => {
  return prices[symbol.toUpperCase()] || null;
};

const getAllPrices = () => ({ ...prices });

const sendToClient = (client, payload) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
};

const broadcastPriceUpdate = (symbol, price) => {
  if (!broadcastClients.size) return;

  const payload = {
    type: "price:update",
    data: {
      symbol,
      price,
      updatedAt: new Date().toISOString(),
    },
  };

  for (const client of broadcastClients) {
    sendToClient(client, payload);
  }
};

const setupPriceBroadcastServer = (server) => { // outbound WS to frontend clients
  if (priceBroadcastServer) {
    return priceBroadcastServer;
  }

  priceBroadcastServer = new WebSocket.Server({
    server,
    path: "/ws/prices",
  });

  priceBroadcastServer.on("connection", (client) => {
    broadcastClients.add(client);

    sendToClient(client, {
      type: "prices:snapshot",
      data: getAllPrices(),
    });

    client.on("close", () => {
      broadcastClients.delete(client);
    });

    client.on("error", () => {
      broadcastClients.delete(client);
    });
  });

  console.log("Live price WebSocket server ready at /ws/prices");
  return priceBroadcastServer;
};

// Start Binance WebSocket
const startPriceStream = (symbols = []) => {
  if (!symbols.length) {
    console.log("No symbols provided to Binance WebSocket");
    return;
  }

  const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/");
  const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  console.log("Connecting to Binance WS...");

  priceFeedSocket = new WebSocket(url);

  priceFeedSocket.on("open", () => {
    console.log("Binance WebSocket connected");
  });

  priceFeedSocket.on("message", (data) => {
    try {
      const parsed = JSON.parse(data);
      const symbol = parsed?.data?.s;
      const price = parseFloat(parsed?.data?.c);

      if (!symbol || Number.isNaN(price)) {
        return;
      }

      prices[symbol] = price;
      
      
      broadcastPriceUpdate(symbol, price);
    } catch (err) {
      console.error("Error parsing Binance WS data:", err.message);
    }
  });

  priceFeedSocket.on("close", () => {
    console.log("Binance WebSocket closed. Reconnecting...");
    priceFeedSocket = null;
    setTimeout(() => startPriceStream(symbols), 5000);
  });

  priceFeedSocket.on("error", (err) => {
    console.error("Binance WebSocket error:", err.message);
    // if (priceFeedSocket) {
      priceFeedSocket.terminate();
    // }
  });
};

module.exports = {
  setupPriceBroadcastServer,
  startPriceStream,
  getPrice,
  getAllPrices,
};
