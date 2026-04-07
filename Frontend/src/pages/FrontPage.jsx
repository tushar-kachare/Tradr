import { Outlet, useLocation } from "react-router-dom";
import CreatePost from "./CreatePost";
import RightPanel from "../components/layout/RightPanel";
import Sidebar from "../components/layout/Sidebar";

const FrontPage = () => {
  const location = useLocation();

  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <div className="flex bg-[#0f0f0f] h-screen text-white overflow-hidden">

      {/* Sidebar */}
      <div className="w-[22%] border-r border-gray-800 p-6">
        <Sidebar />
      </div>

      {/* Middle Section */}
      <div className="w-[50%] relative overflow-y-auto border-x border-[#21262d] p-6">

        {/* 👉 Show background route (Feed) */}
        <Outlet context={{ location: backgroundLocation || location }} />

        {/* 👉 Modal overlay */}
        {backgroundLocation && location.pathname === "/create-post" && (
          <>
            <div className="absolute inset-0 bg-black/40 z-40"></div>

            <div className="absolute inset-0 flex items-center justify-center z-50">
              <CreatePost />
            </div>
          </>
        )}

      </div>

      {/* Right Panel */}
      <div className="w-[28%] border-l border-gray-800 p-6">
        <RightPanel />
      </div>
    </div>
  );
};

export default FrontPage;