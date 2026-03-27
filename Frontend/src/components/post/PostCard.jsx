import PostActions from "./PostActions";
import PostContent from "./PostContent";
import PostHeader from "./PostHeader";
import TradeCard from "./TradeCard";

const PostCard = () => {
  return (
    <div className="px-5 mt-5">
      <div className="p-4 rounded-xl shadow-md shadow-black/20">
        <PostHeader />
        <PostContent />
        <TradeCard />
        <PostActions />
      </div>
    </div>
  );
};
export default PostCard;
