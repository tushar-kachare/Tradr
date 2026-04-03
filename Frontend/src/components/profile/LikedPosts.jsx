import { fetchUserLikes } from "../../api/profileApi";
import { useEffect, useState } from "react";
import PostCard from "../post/PostCard";

const LikedPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);

        const data = await fetchUserLikes(userId);

        const res = data.posts;

        console.log(res);

        setPosts(res);
      } catch (err) {
        console.log(err.message);

        console.log("Failed to fetch Likes");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [userId]);

  if (loading) {
    <div className="mt-4 space-y-4 animate-pulse">
      <div className="h-24 bg-gray-800 rounded-xl" />
      <div className="h-24 bg-gray-800 rounded-xl" />
    </div>;
  }

  if (!posts.length) {
    return (
      <div className="text-gray-400 text-center mt-6">No Likes Made yet.</div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
export default LikedPosts;
