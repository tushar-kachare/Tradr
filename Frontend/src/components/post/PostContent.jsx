import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const getThumb = (url, w = 600) =>
  url?.replace("/upload/", `/upload/w_${w},c_limit,q_auto,f_auto/`);

const PostContent = ({ content, media = [] }) => {
  const [lightbox, setLightbox] = useState(null);

  const getType = (url) => {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.match(/\.(jpg|jpeg|png|webp|gif)/)) return "image";
    if (u.match(/\.(mp4|webm|ogg)/)) return "video";
    if (u.match(/\.(pdf)/)) return "pdf";
    return "unknown";
  };

  const images = media.filter((u) => ["image", "video"].includes(getType(u)));

  return (
    <div className="space-y-3">
      {content && (
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      )}

      {media.length > 0 && (
        <div className={`grid gap-0.5 rounded-xl overflow-hidden ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {media.map((url, index) => {
            const type = getType(url);

            if (type === "image") {
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden cursor-pointer
                    ${media.length === 3 && index === 0 ? "row-span-2" : ""}
                  `}
                  style={{ height: media.length === 1 ? "auto" : 200, maxHeight: media.length === 1 ? 420 : 200 }}
                  onClick={() => setLightbox(index)}
                >
                  <img
                    src={getThumb(url)}
                    alt="post-media"
                    className="w-full h-full object-cover hover:brightness-90 transition"
                    loading="lazy"
                  />
                </div>
              );
            }

            if (type === "video") {
              return (
                <div
                  key={index}
                  className="relative overflow-hidden cursor-pointer"
                  style={{ height: media.length === 1 ? "auto" : 200, maxHeight: media.length === 1 ? 420 : 200 }}
                  onClick={() => setLightbox(index)}
                >
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  {/* play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-3">
                      <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            }

            if (type === "pdf") {
              return (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-[#1f1f1f] p-3 transition hover:bg-[#2a2a2a]"
                >
                  <span className="text-gray-300 text-sm">📄 PDF Document</span>
                  <span className="text-blue-400 text-xs">Open</span>
                </a>
              );
            }

            return (
              <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300 transition hover:bg-white/10"
              >
                Open attachment
              </a>
            );
          })}
        </div>
      )}

      {lightbox !== null && (
        <Lightbox
          urls={images}
          index={images.indexOf(media[lightbox])}
          onClose={() => setLightbox(null)}
          onChange={(i) => setLightbox(media.indexOf(images[i]))}
        />
      )}
    </div>
  );
};

const Lightbox = ({ urls, index, onClose, onChange }) => {
  const url = urls[index];
  const type = url?.toLowerCase().match(/\.(mp4|webm|ogg)/) ? "video" : "image";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={onClose}>
        <X size={28} />
      </button>

      {index > 0 && (
        <button className="absolute left-4 text-white/70 hover:text-white z-10"
          onClick={(e) => { e.stopPropagation(); onChange(index - 1); }}
        >
          <ChevronLeft size={36} />
        </button>
      )}

      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {type === "video" ? (
          <video src={url} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg" />
        ) : (
          <img src={url} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        )}
      </div>

      {index < urls.length - 1 && (
        <button className="absolute right-4 text-white/70 hover:text-white z-10"
          onClick={(e) => { e.stopPropagation(); onChange(index + 1); }}
        >
          <ChevronRight size={36} />
        </button>
      )}

      {urls.length > 1 && (
        <div className="absolute bottom-4 flex gap-1.5">
          {urls.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostContent;