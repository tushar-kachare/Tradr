import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FrontPage from "./pages/FrontPage";
import FeedSection from "./components/layout/FeedSection";
import CreatePost from "./pages/CreatePost";
import CreateTrade from "./pages/CreateTrade";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import FollowListPage from "./pages/FollowListPage";
import PortfolioPage from "./pages/PortfolioPage";
import TradePage from "./pages/TradePage";

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      {/* Main Routes */}
      <Routes location={backgroundLocation || location}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FrontPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<FeedSection />} />
          <Route path="create-trade" element={<CreateTrade />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route
            path="profile/:username/connections"
            element={<FollowListPage />}
          />
          <Route path="portfolio/:portfolioId" element={<PortfolioPage />} />
          <Route path="trades/:tradeId" element={<TradePage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Modal Overlay */}
      {backgroundLocation && location.pathname === "/create-post" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <CreatePost />
        </div>
      )}
    </>
  );
};

export default AppRoutes;
