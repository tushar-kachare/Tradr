import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchFollowers,
  fetchFollowing,
  fetchProfile,
  followUser,
  unFollowUser,
} from "../api/profileApi";
import { useAuth } from "../context/AuthContext";
import { getDisplayName, getUserInitial } from "../utils/userDisplay";

const FollowUserRow = ({ user, currentUser, onToggleFollow, disabled }) => {
  const initials = getUserInitial(user);

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <Link
        to={`/profile/${user.username}`}
        className="flex min-w-0 items-center gap-3"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.username} avatar`}
            className="h-12 w-12 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-white">
              {getDisplayName(user)}
            </p>
            {user.isVerified && (
              <span className="text-sm text-blue-400">✔</span>
            )}
          </div>
          <p className="truncate text-sm text-gray-400">@{user.username}</p>
        </div>
      </Link>

      {currentUser.username != user.username && (
        <button
          type="button"
          onClick={() => onToggleFollow(user)}
          disabled={disabled}
          className={`min-w-[96px] rounded-full px-4 py-2 text-sm font-medium transition ${
            user.isFollowing
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {user.isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
};

const FollowListPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingUsername, setPendingUsername] = useState(null);
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab === "followers" ? "followers" : "following",
  );

  useEffect(() => {
    setActiveTab(
      location.state?.activeTab === "followers" ? "followers" : "following",
    );
  }, [username, location.state]);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, listRes] = await Promise.all([
          fetchProfile(username),
          activeTab === "followers"
            ? fetchFollowers(username)
            : fetchFollowing(username),
        ]);

        setProfile(profileRes);
        setUsers(
          activeTab === "followers"
            ? (listRes.followers ?? [])
            : (listRes.following ?? []),
        );
      } catch {
        setError(`Failed to load ${activeTab}`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [username, activeTab]);

  const counts = useMemo(
    () => ({
      followers: profile?.user?.followersCount ?? 0,
      following: profile?.user?.followingCount ?? 0,
    }),
    [profile],
  );

  const handleToggleFollow = async (targetUser) => {
    const previousUsers = users;
    const wasFollowing = targetUser.isFollowing;

    setPendingUsername(targetUser.username);
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === targetUser.id
          ? { ...currentUser, isFollowing: !currentUser.isFollowing }
          : currentUser,
      ),
    );

    try {
      if (wasFollowing) {
        await unFollowUser(targetUser.username);
      } else {
        await followUser(targetUser.username);
      }
    } catch {
      setUsers(previousUsers);
    } finally {
      setPendingUsername(null);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[750px]">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0f0f0f]/95 px-4 py-4 backdrop-blur">
          <div className="grid grid-cols-[40px_1fr_40px] items-center">
            <button
              type="button"
              onClick={() =>
                navigate(`/profile/${username}`, { replace: true })
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </button>

            <p className="text-center text-base font-semibold text-white">
              {profile?.user ? getDisplayName(profile.user) : `@${username}`}
            </p>

            <div />
          </div>

          <div className="mt-4 flex">
            {["following", "followers"].map((section) => {
              const isActive = activeTab === section;

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveTab(section)}
                  className="relative flex-1 py-3 text-sm font-medium capitalize"
                >
                  <span
                    className={`transition ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {section} {counts[section]}
                  </span>

                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 px-4 py-6">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
              Loading {activeTab}...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-8 text-center text-sm text-red-300">
              {error}
            </div>
          ) : users.length > 0 ? (
            users.map((listUser) => (
              <FollowUserRow
                key={listUser.id}
                user={listUser}
                currentUser={currentUser}
                onToggleFollow={handleToggleFollow}
                disabled={pendingUsername === listUser.username}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
              No {activeTab} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListPage;
