import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repostPost, getPostById } from "../api/postActions";
import PostHeader from "../components/Post/PostHeader";
import PostContent from "../components/Post/PostContent";
import TradeCard from "../components/Post/TradeCard";
import RepostWrapper from "../components/Post/RepostWrapper";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const RepostPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  console.log(postId);

  const [content, setContent] = useState("");
  const [originalPost, setOriginalPost] = useState(null);
  const [loading, setLoading] = useState(false);

  // ESC close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Fetch original post
  useEffect(() => {
    const fetchPost = async () => {
      console.log(postId);

      try {
        const res = await getPostById(postId);
        setOriginalPost(res.data.post);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Write something for repost");
      return;
    }

    try {
      setLoading(true);

      await repostPost({
        content,
        originalPostId: postId,
      });

      toast.success("Reposted successfully!");
      navigate("/");
    } catch (err) {
      console.log(err.message);
      toast.error("Failed to repost");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[700px] bg-[#0f0f0f] border border-gray-700 rounded-2xl p-4 shadow-xl">
      <h2 className="text-lg text-white font-semibold mb-2">Repost</h2>

      {/* TEXT ONLY */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add your thoughts..."
        className="w-full h-20 bg-[#1a1a1a] p-2 rounded-lg text-white border border-gray-700 outline-none resize-none"
      />

      {/* ORIGINAL POST */}
      {originalPost && (
        <div className="mt-3">
          <RepostWrapper>
            <PostHeader
              user={originalPost.user}
              createdAt={originalPost.createdAt}
            />
            <PostContent
              content={originalPost.content}
              media={originalPost.mediaUrls}
            />
            {originalPost.trade && <TradeCard trade={originalPost.trade} />}
          </RepostWrapper>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1.5 bg-red-700 rounded-lg hover:bg-red-600"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Reposting..." : "Repost"}
        </button>
      </div>
    </div>
  );
};

export default RepostPage;
