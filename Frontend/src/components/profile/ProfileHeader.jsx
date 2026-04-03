import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { followUser, unFollowUser } from "../../api/profileApi";

const ProfileHeader = ({ profile }) => {
  const navigate = useNavigate();

  const { user, isOwnProfile } = profile;

  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [followersCount, setFollowersCount] = useState(user.followersCount);

  useEffect(() => {
    setIsFollowing(profile.isFollowing);
    setFollowersCount(user.followersCount);
  }, [profile.isFollowing, user.followersCount]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        // 🔴 UNFOLLOW
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);

        await unFollowUser(user.username);
      } else {
        // 🟢 FOLLOW
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);

        await followUser(user.username);
      }
    } catch (err) {
      console.log("Follow action failed");

      // ❌ rollback
      if (isFollowing) {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      } else {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      }
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
              {user.username[0].toUpperCase()}
            </div>
          )}

          {/* Name + username */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{user.username}</h2>

              {user.isVerified && (
                <span className="text-blue-400 text-sm">✔</span>
              )}
            </div>

            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <MoreHorizontal size={18} />
          </button>

          {isOwnProfile ? (
            <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm">
              Edit
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                isFollowing
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
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
          <span className="font-semibold text-white">{followersCount}</span>{" "}
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
    </div>
  );
};

export default ProfileHeader;
