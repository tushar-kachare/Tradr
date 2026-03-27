import { useState } from "react";

const FeedTabs = () => {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <div className="w-full flex justify-center gap-6">
      
      {/* Explore Tab */}
      <button
        onClick={() => setActiveTab("explore")}
        className={`w-1/2 py-2 rounded-full border transition-all duration-200 cursor-pointer
        ${
          activeTab === "explore"
            ? "bg-gray-900 text-white border-gray-500"
            : "bg-transparent text-gray-300 border-gray-500 hover:bg-gray-800 hover:text-white"
        }`}
      >
        Explore
      </button>

      {/* Following Tab */}
      <button
        onClick={() => setActiveTab("following")}
        className={`w-1/2 py-2 rounded-full border transition-all duration-200 cursor-pointer
        ${
          activeTab === "following"
            ? "bg-gray-900 text-white border-gray-500"
            : "bg-transparent text-gray-300 border-gray-500 hover:bg-gray-800 hover:text-white"
        }`}
      >
        Following
      </button>

    </div>
  );
};

export default FeedTabs;