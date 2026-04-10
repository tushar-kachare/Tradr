import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  User,
  Bell,
  BookOpen,
  Settings,
  Plus,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Top Section */}
      <div>
        <div className="">
          <img
            src="/logo2.png"
            alt="Tradr"
            className="w-full object-contain max-h-32"
          />
        </div>

        <nav className="flex flex-col gap-2 text-gray-400">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <Home size={20} />
            <p>Home</p>
          </Link>

          <Link
            to={`/profile/${user.username}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <User size={20} />
            <p>Profile</p>
          </Link>

          <Link
            to="/notifications"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <Bell size={20} />
            <p>Notifications</p>
          </Link>

          <Link
            to="/education"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <BookOpen size={20} />
            <p>Education</p>
          </Link>

          <Link
            to="/setting"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <Settings size={20} />
            <p>Settings</p>
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-3 relative">
        <button
          onClick={() => setShowCreateMenu((prev) => !prev)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-3 rounded-lg font-semibold"
        >
          <Plus size={18} />
          Create
        </button>

        {/* Dropdown */}
        {showCreateMenu && (
          <div className="mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-md overflow-hidden">
            <Link
              to="/create-post"
              state={{ backgroundLocation: location }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
            >
              <FileText size={18} />
              Post
            </Link>

            <Link
              to="/create-trade"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
            >
              <TrendingUp size={18} />
              Share Trade
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
