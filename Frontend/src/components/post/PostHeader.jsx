const PostHeader = () => {
  const user = {
    name: "Priyanshu",
    username: "losser_80",
    avatar: "https://i.pravatar.cc/100",
    isVerified: true,
    time: "1h",
  };

  return (
    <div className="flex items-center justify-between">
      {/* LEFT SIDE */}
      <a href="/profile/:userId">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <img
            src={user.avatar}
            alt="avatar"
            className="w-10 h-10 rounded-lg object-cover"
          />

          {/* Name + Username */}
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold">{user.name}</span>

              {/* Verified Badge */}
              {user.isVerified && (
                <span className="text-blue-500 text-sm">✔</span>
              )}
            </div>

            <span className="text-gray-400 text-sm">
              @{user.username} • {user.time}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default PostHeader;
