import FeedSection from "../components/layout/FeedSection";
import RightPanel from "../components/layout/RightPanel";
import Sidebar from "../components/layout/Sidebar";

const FrontPage = () => {
  return (
    <div className="flex bg-[#0f0f0f] h-screen  text-white overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-[18%] border-r border-gray-800 p-6">
        <Sidebar />
      </div>

      {/* Feed Section (WIDER) */}
      <div className="w-[60%] overflow-y-auto border-x border-[#21262d] p-6">
        <FeedSection />
      </div>

      {/* Right Panel (SMALLER) */}
      <div className="w-[22%] border-l border-gray-800 p-6">
        <RightPanel />
      </div>

    </div>
  );
};
export default FrontPage;
