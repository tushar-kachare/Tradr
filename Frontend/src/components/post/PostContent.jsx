const PostContent = ({ content, media = [] }) => {
  return (
    <div className="mt-3 space-y-3">
      
      {/* TEXT CONTENT */}
      {true && (
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vitae quisquam, cumque qui amet laudantium modi quia molestias nihil rem consequuntur ab accusantium ipsa temporibus sunt eos nulla soluta unde animi.
        </p>
      )}

      {/* MEDIA CONTENT */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {media.map((file, index) => {
            const type = file.type;

            // IMAGE
            if (type === "image") {
              return (
                <img
                  key={index}
                  src={file.url}
                  alt="post-media"
                  className="rounded-lg object-cover w-full h-40"
                />
              );
            }

            // VIDEO
            if (type === "video") {
              return (
                <video
                  key={index}
                  controls
                  className="rounded-lg w-full h-40 object-cover"
                >
                  <source src={file.url} />
                </video>
              );
            }

            // PDF
            if (type === "pdf") {
              return (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] transition"
                >
                  <span className="text-gray-300 text-sm">📄 PDF Document</span>
                  <span className="text-blue-400 text-xs">Open</span>
                </a>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default PostContent;