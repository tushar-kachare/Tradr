import { Link } from "react-router-dom";
const Sidebar = () => {
  return (
    <div className="h-full flex flex-col p-4">
      {/* Top Section */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Logo</h1>

        <nav className="flex flex-col gap-2 text-gray-500">
          <Link
            to={"/"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
          >
            <span>🏠</span>
            <p>Home</p>
          </Link>
          <Link
            to={"/profile"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
          >
            <span>👤</span>
            <p>Profile</p>
          </Link>

          <Link
            to={"/notifications"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
          >
            <span>🔔</span>
            <p>Notifications</p>
          </Link>
          <Link
            to={"/education"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
          >
            <span>📚</span>
            <p>Education</p>
          </Link>

          <Link
            to={"/setting"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
          >
            <span>⚙️</span>
            <p>Settings</p>
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-3 rounded-lg font-semibold cursor-pointer">
        Create
      </button>
    </div>
  );
};
export default Sidebar;
