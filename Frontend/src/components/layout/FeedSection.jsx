import { useEffect, useState } from "react";
import FeedTabs from "../feed/FeedTabs";
import PostCard from "../post/PostCard";
import { fetchExplorePosts, fetchFeedPosts } from "../../api/fetchPosts";

const FeedSection = () => {
  const [activeTab, setActiveTab] = useState("explore");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);

      try {
        const request =
          activeTab === "following" ? fetchFeedPosts : fetchExplorePosts;
        const res = await request();

        setPosts(res.data.data ?? []);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[750px] px-4">
        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
              Loading posts...
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-gray-400">
              {activeTab === "following"
                ? "No posts from people you follow yet."
                : "No posts available in explore right now."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedSection;
