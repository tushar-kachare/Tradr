import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import PostCard from "../components/post/PostCard";
import CommentInput from "../components/post/CommentInput";
import CommentList from "../components/post/CommentList";
import { getPostById, getPostComments } from "../api/postActions";

const SinglePostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [commentsError, setCommentsError] = useState("");

  const fetchPost = useCallback(async () => {
    try {
      setPostLoading(true);
      setPostError("");
      const response = await getPostById(postId);
      setPost(response.data.post);
    } catch (error) {
      setPostError(
        error.response?.data?.message || "We couldn't load this post.",
      );
    } finally {
      setPostLoading(false);
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      setCommentsError("");

      const collectedComments = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await getPostComments(postId, {
          page,
          limit: 50,
        });
        const payload = response.data.data;

        collectedComments.push(...(payload?.comments || []));
        hasNextPage = Boolean(payload?.pagination?.hasNextPage);
        page += 1;
      }

      setComments(collectedComments);
    } catch (error) {
      setCommentsError(
        error.response?.data?.message || "We couldn't load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  const refreshComments = useCallback(async () => {
    await Promise.all([fetchPost(), fetchComments()]);
  }, [fetchComments, fetchPost]);

  useEffect(() => {
    refreshComments();
  }, [refreshComments]);

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[750px] pb-28">
        <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 px-5 py-4 backdrop-blur">
          <div className="flex justify-start">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 text-gray-300 transition hover:border-gray-700 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>

        <div className="space-y-3 px-0 pb-5">
          {postLoading ? (
            <div className="mx-5 rounded-2xl border border-gray-800 bg-[#0f0f0f] px-4 py-10 text-center text-sm text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading post...
              </div>
            </div>
          ) : postError ? (
            <div className="mx-5 rounded-2xl border border-red-900/60 bg-red-950/20 px-4 py-8 text-center text-sm text-red-300">
              {postError}
            </div>
          ) : (
            post && <PostCard post={post} disableNavigation />
          )}

          <div className="px-5">
            <CommentList
              comments={comments}
              loading={commentsLoading}
              error={commentsError}
            />
          </div>
        </div>

        {!postLoading && !postError && post && (
          <CommentInput postId={postId} onCommentCreated={refreshComments} />
        )}
      </div>
    </div>
  );
};

export default SinglePostPage;
