import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import LivePriceProvider from "./components/providers/LivePriceProvider";

function App() {
  return (
    <BrowserRouter>
      <LivePriceProvider>
        <AppRoutes />
      </LivePriceProvider>
    </BrowserRouter>
  );
}

export default App;
