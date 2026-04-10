import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { followUser, unFollowUser } from "../../api/profileApi";
import EditProfileModal from "./EditProfileModal";
import { getDisplayName, getUserInitial } from "../../utils/userDisplay";

const ProfileHeader = ({ profile, onProfileUpdated, onRefreshProfile }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { user, isOwnProfile } = profile;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      if (profile.isFollowing) {
        await unFollowUser(user.username);
      } else {
        await followUser(user.username);
      }

      await onRefreshProfile?.();
    } catch {
      console.log("Follow action failed");
    } finally {
      setFollowLoading(false);
    }
  };
  return (
    <div className="border-b border-gray-800 pb-5 mb-4">
      {/* 🔝 Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div /> {/* spacer */}
      </div>

      {/* 👤 User Info */}
      <div className="flex justify-between items-start">
        {/* Left */}
        <div className="flex gap-4">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center text-lg font-semibold">
              {getUserInitial(user)}
            </div>
          )}

          {/* Name + username */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{getDisplayName(user)}</h2>

              {user.isVerified && (
                <span className="text-blue-400 text-sm">✔</span>
              )}
            </div>

            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          {isOwnProfile ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-20 min-w-[170px] rounded-xl border border-white/10 bg-[#12151c] p-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                  >
                    Edit profile
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                profile.isFollowing
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-blue-500 hover:bg-blue-600"
              } disabled:opacity-60`}
            >
              {followLoading
                ? "Please wait..."
                : profile.isFollowing
                  ? "Following"
                  : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* 📝 Bio */}
      {user.bio && <p className="mt-3 text-sm text-gray-300">{user.bio}</p>}

      {/* 📊 Followers */}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() =>
            navigate(`/profile/${user.username}/connections`, {
              state: { activeTab: "followers" },
            })
          }
          className="transition hover:text-white"
        >
          <span className="font-semibold text-white">
            {user.followersCount}
          </span>{" "}
          <span className="text-gray-400">Followers</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(`/profile/${user.username}/connections`, {
              state: { activeTab: "following" },
            })
          }
          className="transition hover:text-white"
        >
          <span className="font-semibold text-white">
            {user.followingCount}
          </span>{" "}
          <span className="text-gray-400">Following</span>
        </button>
      </div>

      <EditProfileModal
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={onProfileUpdated}
      />
    </div>
  );
};

export default ProfileHeader;
