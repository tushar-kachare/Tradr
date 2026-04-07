import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  LogOut,
  Users,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTopUsers, searchUser } from "../../api/userApis";
import { logoutUser } from "../../api/authApi";

// Improved Avatar (controlled sizing + better UI)
const Avatar = ({ url, username, size = 40 }) => (
  <div
    style={{ width: size, height: size }}
    className="rounded-full bg-[#1a1d26] border border-white/10 flex items-center justify-center overflow-hidden shrink-0"
  >
    {url ? (
      <img src={url} alt={username} className="w-full h-full object-cover" />
    ) : (
      <span className="text-white font-semibold text-sm uppercase">
        {username?.[0] || "?"}
      </span>
    )}
  </div>
);

// Improved User Row (bigger + cleaner)
const UserRow = ({ user, navigate }) => (
  <div
    onClick={() => navigate(`/profile/${user.username}`)}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition"
  >
    <Avatar url={user.avatarUrl} username={user.username} size={42} />

    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[14px] text-white font-medium truncate">
        @{user.username}
      </span>
      <span className="text-xs text-gray-400 flex items-center gap-1">
        <Users className="w-3 h-3" />
        {user.followersCount} followers
      </span>
    </div>
  </div>
);

const RightPanel = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [topUsers, setTopUsers] = useState([]);
  const menuRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await getTopUsers();
        setTopUsers(res.data.data.users);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopUsers();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) return;

      setSearching(true);
      try {
        const res = await searchUser(query.trim(), 5);
        setSearchResults(res.data.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 px-3 text-white">
      {/* Profile Card */}
      <div className="p-4 hover:border-white/20 transition">
        <div
          onClick={() => navigate(`/profile/${user.username}`)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar url={user?.avatarUrl} username={user?.username} size={50} />
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-semibold truncate">
                @{user?.username}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-white/10 bg-[#12151c] shadow-xl overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="  p-4 flex flex-col gap-3">
        <p className="text-xs text-white font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          Search Users
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username..."
            className="w-full bg-[#1a1d26] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/40"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {query.trim().length >= 2 && (
          <div className="flex flex-col gap-1">
            {searching ? (
              <p className="text-xs text-gray-500 px-2">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-gray-500 px-2">No users found</p>
            ) : (
              searchResults.map((u) => (
                <UserRow key={u.id} user={u} navigate={navigate} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Top Users */}
      <div className=" p-4 flex flex-col gap-3">
        <p className="text-xs text-white font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Top Users
        </p>

        <div className="flex flex-col gap-1">
          {topUsers.length === 0 ? (
            <p className="text-xs text-gray-500 px-2">No users yet</p>
          ) : (
            topUsers.map((u) => (
              <UserRow key={u.id} user={u} navigate={navigate} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
