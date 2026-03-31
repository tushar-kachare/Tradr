import { fetchUserPosts } from "../../api/profileApi";
import { useEffect, useState } from "react";
import PostCard from "../post/PostCard";

const PostList = ({ userId, profile }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);

        const data = await fetchUserPosts(userId);

        // console.log(data.posts);
        const res = data.posts
        const postsWithUser = res.map((post) => {
          return {
            ...post,
            user: profile.user,
          };
        });

        setPosts(postsWithUser);
        console.log(postsWithUser);
      } catch (err) {
        console.log(err.message);
        
        console.log("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [userId, profile]);

  if (loading) {
    <div className="mt-4 space-y-4 animate-pulse">
      <div className="h-24 bg-gray-800 rounded-xl" />
      <div className="h-24 bg-gray-800 rounded-xl" />
    </div>;
  }

  if (!posts.length) {
    return <div className="text-gray-400 text-center mt-6">No posts yet</div>;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
export default PostList