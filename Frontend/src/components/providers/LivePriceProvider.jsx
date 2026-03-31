import { useEffect } from "react";
import { useLivePriceStore } from "../../store/livePriceStore";

const LivePriceProvider = ({ children }) => {
  const connect = useLivePriceStore((state) => state.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  return children;
};

export default LivePriceProvider;
