import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import LivePriceProvider from "./components/providers/LivePriceProvider";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <LivePriceProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </LivePriceProvider>
    </BrowserRouter>
  );
}

export default App;