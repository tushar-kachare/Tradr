import { useCallback } from "react";
import { fetchUserLikes } from "../../api/profileApi";
import PostCard from "../post/PostCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const LikedPosts = ({ userId }) => {
  const fetchFn = useCallback(
    (page) =>
      fetchUserLikes(userId, { page, limit: 10 }).then((res) => ({
        posts: res.posts,
        pagination: res.pagination,
      })),
    [userId]
  );

  const { items: posts, loading, error, sentinelRef } = useInfiniteScroll(
    fetchFn,
    [userId]
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      {loading && posts.length === 0 && (
        <div className="mt-4 space-y-4 animate-pulse">
          <div className="h-24 bg-gray-800 rounded-xl" />
          <div className="h-24 bg-gray-800 rounded-xl" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-gray-400 text-center mt-6">No liked posts yet.</div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {error && <p className="text-center text-rose-400 text-sm">{error}</p>}

      <div ref={sentinelRef} className="py-4 text-center text-sm text-gray-600">
        {loading && posts.length > 0 && "Loading more..."}
      </div>
    </div>
  );
};

export default LikedPosts;