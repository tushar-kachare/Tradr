import { useState, useCallback } from "react";
import FeedTabs from "../feed/FeedTabs";
import PostCard from "../post/PostCard";
import { fetchExplorePosts, fetchFeedPosts } from "../../api/fetchPosts";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const FeedSection = () => {
  const [activeTab, setActiveTab] = useState("explore");

  const fetchFn = useCallback(
    (page) => {
      const request =
        activeTab === "following" ? fetchFeedPosts : fetchExplorePosts;
      return request({ page, limit: 10 }).then((res) => ({
        posts: res.data.data, // rename data → posts
        pagination: res.data.pagination,
      }));
    },
    [activeTab],
  );

  const {
    items: posts = [],
    loading,
    error,
    sentinelRef,
  } = useInfiniteScroll(fetchFn, [activeTab]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[750px] px-4">
        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6 space-y-6">
          {/* Initial load */}
          {loading && posts.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
              Loading posts...
            </div>
          )}

          {/* Empty state */}
          {!loading && posts.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
              {activeTab === "following"
                ? "No posts from people you follow yet."
                : "No posts available in explore right now."}
            </div>
          )}

          {/* Posts */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Error */}
          {error && (
            <p className="text-center text-rose-400 text-sm py-4">{error}</p>
          )}

          {/* Sentinel */}
          <div
            ref={sentinelRef}
            className="py-4 text-center text-sm text-gray-600"
          >
            {loading && posts.length > 0 && "Loading more..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedSection;
