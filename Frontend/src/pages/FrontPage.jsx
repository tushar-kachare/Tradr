import FeedSection from "../components/layout/FeedSection";
import RightPanel from "../components/layout/RightPanel";
import Sidebar from "../components/layout/Sidebar";

const FrontPage = () => {
  return (
    <div className="flex bg-[#0f0f0f] h-screen p-10 text-white overflow-hidden">
      <div className="w-1/5 border-r border-gray-800">
        <Sidebar />
      </div>
      <div className="flex-1 max-w-[700px] overflow-y-auto border-x border-[#21262d]">
        <FeedSection />
      </div>
      <div className="w-1/5 border-l border-gray-800">
        <RightPanel />
      </div>
    </div>
  );
};
export default FrontPage;
