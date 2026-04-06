const PostContent = ({ content, media = [] }) => {
  const getType = (url) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();

    if (lowerUrl.match(/\.(jpg|jpeg|png|webp|gif)$/)) return "image";
    if (lowerUrl.match(/\.(mp4|webm|ogg)$/)) return "video";
    if (lowerUrl.match(/\.(pdf)$/)) return "pdf";

    return "unknown";
  };

  return (
    <div className="space-y-3">
      {content && (
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      )}

      {media.length > 0 && (
        <div
          className={`grid gap-2 ${
            media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {media.map((url, index) => {
            const type = getType(url);

            if (type === "image") {
              return (
                <img
                  key={index}
                  src={url}
                  alt="post-media"
                  className={`w-full rounded-xl object-cover ${
                    media.length === 1 ? "max-h-[420px]" : "h-40"
                  }`}
                />
              );
            }

            if (type === "video") {
              return (
                <video
                  key={index}
                  controls
                  className={`w-full rounded-xl object-cover ${
                    media.length === 1 ? "max-h-[420px]" : "h-40"
                  }`}
                >
                  <source src={url} />
                </video>
              );
            }

            if (type === "pdf") {
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-[#1f1f1f] p-3 transition hover:bg-[#2a2a2a]"
                >
                  <span className="text-gray-300 text-sm">📄 PDF Document</span>
                  <span className="text-blue-400 text-xs">Open</span>
                </a>
              );
            }

            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300 transition hover:bg-white/10"
              >
                Open attachment
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostContent;
