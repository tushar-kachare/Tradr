import { Link } from "react-router-dom";
import { getDisplayName, getUserInitial } from "../../utils/userDisplay";
const formatPostDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
};

const PostHeader = ({ user, createdAt }) => {
  const timestamp = formatPostDate(createdAt);
  const initials = getUserInitial(user);

  console.log(initials);
  
  console.log(getDisplayName(user));
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user.username}`}>
          <div className="shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user?.username || "User"} avatar`}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white">
                {initials}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">
              {getDisplayName(user)}
            </span>

            {user?.isVerified && (
              <span className="text-blue-500 text-sm">✔</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>@{user?.username || "unknown"}</span>
            {timestamp && <span>{timestamp}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
