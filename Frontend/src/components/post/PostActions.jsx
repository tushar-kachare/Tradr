import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Bookmark } from "lucide-react";

const PostActions = () => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [counts, setCounts] = useState({
    likes: 203,
    comments: 55,
    reposts: 31,
  });

  const handleLike = () => {
    setLiked(!liked);
    setCounts((prev) => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  return (
    <div className="flex justify-between items-center mt-3 text-gray-400">
      
      {/* LEFT ACTIONS */}
      <div className="flex items-center gap-6">
        
        {/* LIKE */}
        <button
          onClick={handleLike}
          className="flex items-center gap-2 hover:text-red-400 transition"
        >
          <Heart
            size={18}
            className={liked ? "fill-red-500 text-red-500" : ""}
          />
          <span className="text-sm">{counts.likes}</span>
        </button>

        {/* COMMENT */}
        <button className="flex items-center gap-2 hover:text-blue-400 transition">
          <MessageCircle size={18} />
          <span className="text-sm">{counts.comments}</span>
        </button>

        {/* REPOST */}
        <button className="flex items-center gap-2 hover:text-green-400 transition">
          <Repeat2 size={18} />
          <span className="text-sm">{counts.reposts}</span>
        </button>

      </div>

      {/* RIGHT ACTION */}
      <button
        onClick={() => setBookmarked(!bookmarked)}
        className="hover:text-yellow-400 transition"
      >
        <Bookmark
          size={18}
          className={bookmarked ? "fill-yellow-400 text-yellow-400" : ""}
        />
      </button>

    </div>
  );
};

export default PostActions;