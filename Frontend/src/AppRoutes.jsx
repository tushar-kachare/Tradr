import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FrontPage from "./pages/FrontPage";
import FeedSection from "./components/layout/FeedSection";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";

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