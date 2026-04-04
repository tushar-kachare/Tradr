import { useAuth } from "../../context/AuthContext";

const ProfileTabs = ({ activeTab, setActiveTab, user }) => {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === user?.id;

  const tabs = [
    "portfolios",
    "posts",
    "likes",
    ...(isOwner ? ["bookmarks"] : []), // only show for own profile
  ];

  return (
    <div className="relative border-b border-gray-800">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm font-medium capitalize relative"
          >
            {/* Text */}
            <span
              className={`transition ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </span>

            {/* 🔥 Active underline */}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
export default ProfileTabs;
