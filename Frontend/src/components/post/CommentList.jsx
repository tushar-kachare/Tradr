const formatCommentDate = (dateValue) => {
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

const CommentList = ({ comments = [], loading = false, error = "" }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0f0f0f] px-4 py-6 text-center text-sm text-gray-400">
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-4 py-6 text-center text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0f0f0f] px-4 py-8 text-center text-sm text-gray-400">
        No comments yet
      </div>
    );
  }

  return (
    <div className="overflow-hidden  bg-[#0f0f0f]">
      {comments.map((comment) => {
        const initials = (comment.user?.username || "U")
          .slice(0, 1)
          .toUpperCase();
        const timestamp = formatCommentDate(comment.createdAt);

        return (
          <div
            key={comment.id}
            className="flex gap-3 px-4 py-4 border-b border-white/5 last:border-b-0"
          >
            <div className="shrink-0">
              {comment.user?.avatarUrl ? (
                <img
                  src={comment.user.avatarUrl}
                  alt={`${comment.user?.username || "User"} avatar`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="truncate font-semibold text-white">
                  {comment.user?.username || "Unknown user"}
                </span>
                {timestamp && (
                  <span className="text-gray-500">{timestamp}</span>
                )}
              </div>

              <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-gray-300">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;
