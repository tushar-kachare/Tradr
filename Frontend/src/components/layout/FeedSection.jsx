import FeedTabs from "../feed/FeedTabs";
import PostCard from "../post/PostCard";
const FeedSection = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[750px] px-4">
        <FeedTabs />
        
        <div className="mt-6 space-y-6">
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
        </div>
      </div>
    </div>
  );
};

export default FeedSection;
