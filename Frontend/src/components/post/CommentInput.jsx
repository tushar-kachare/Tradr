import { useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { createPostComment } from "../../api/postActions";

const CommentInput = ({ postId, onCommentCreated }) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await createPostComment(postId, trimmedContent);
      setContent("");
      await onCommentCreated?.();
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to post comment right now.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-gray-800 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-[600px] items-end gap-3"
      >
        <div className="flex-1">
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            disabled={submitting}
            className="w-full rounded-full border border-gray-800 bg-[#161616] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          aria-label="Post comment"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <SendHorizontal size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default CommentInput;
