import { Compass, Users } from "lucide-react";

const FeedTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full flex justify-center">
      
      <div className="flex w-full max-w-md bg-[#1a1a1a] p-1 rounded-full border border-gray-700">

        {/* Explore Tab */}
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center justify-center gap-2 w-1/2 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${
            activeTab === "explore"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Compass size={16} />
          Explore
        </button>

        {/* Following Tab */}
        <button
          onClick={() => setActiveTab("following")}
          className={`flex items-center justify-center gap-2 w-1/2 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${
            activeTab === "following"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users size={16} />
          Following
        </button>

      </div>

    </div>
  );
};

export default FeedTabs;