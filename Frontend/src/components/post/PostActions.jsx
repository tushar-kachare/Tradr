import { useEffect, useState } from "react";
import { Heart, MessageCircle, Repeat2, Bookmark } from "lucide-react";
import {
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
} from "../../api/postActions";
import { useLocation, useNavigate } from "react-router-dom";

const PostActions = ({ post }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);

  const [counts, setCounts] = useState({
    likes: post.likesCount || 0,
    comments: post.commentsCount || 0,
    reposts: post.repostsCount || 0,
  });

  useEffect(() => {
    setLiked(post.isLiked || false);
    setBookmarked(post.isBookmarked || false);
    setCounts({
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      reposts: post.repostsCount || 0,
    });
  }, [
    post.isLiked,
    post.isBookmarked,
    post.likesCount,
    post.commentsCount,
    post.repostsCount,
  ]);

  const handleLike = async (event) => {
    event.stopPropagation();
    const newLiked = !liked;

    setLiked(newLiked);
    setCounts((prev) => ({
      ...prev,
      likes: newLiked ? prev.likes + 1 : prev.likes - 1,
    }));

    try {
      if (newLiked) {
        const res = await likePost(post.id);
        console.log(res.message);
      } else {
        const res = await unlikePost(post.id);
        console.log(res.message);
      }
    } catch (err) {
      setLiked(!newLiked);
      setCounts((prev) => ({
        ...prev,
        likes: newLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    }
  };

  const handleBookmark = async (event) => {
    event.stopPropagation();
    const newBookmarked = !bookmarked;

    // ✅ optimistic UI
    setBookmarked(newBookmarked);

    try {
      if (newBookmarked) {
        const res = await bookmarkPost(post.id);
        console.log(res.data.message);
      } else {
        const res = await unbookmarkPost(post.id);
        console.log(res.data.message);
      }
    } catch (err) {
      setBookmarked(!newBookmarked);
      console.log(err.message);
    }
  };

  return (
    <div
      className="flex items-center justify-between text-gray-400"
      onClick={(event) => event.stopPropagation()}
    >
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
        <button
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/post/${post.id}`);
          }}
          className="flex items-center gap-2 transition hover:text-blue-400"
        >
          <MessageCircle size={18} />
          <span className="text-sm">{counts.comments}</span>
        </button>

        {/* REPOST */}
        <button
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/repost/${post.id}`, {
              state: { backgroundLocation: location },
            });
          }}
          className="flex items-center gap-2 transition hover:text-green-400"
        >
          <Repeat2 size={18} />
          <span className="text-sm">{counts.reposts}</span>
        </button>
      </div>

      {/* RIGHT ACTION */}
      <button
        onClick={handleBookmark}
        className="transition hover:text-yellow-400"
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
