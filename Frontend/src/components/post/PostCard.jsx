import PostActions from "./PostActions";
import PostContent from "./PostContent";
import PostHeader from "./PostHeader";
import RepostWrapper from "./RepostWrapper";
import TradeCard from "./TradeCard";

const PostCard = ({ post }) => {
  const isRepost = post.postType === "repost";
  const hasTrade = Boolean(post.trade);
  const originalPost = post.originalPost;
  const originalPostAvailable = Boolean(originalPost);

  return (
    <div className="px-5 mt-5">
      <div className="rounded-2xl border border-white/10 bg-[#0f1117] p-4 shadow-md shadow-black/20">
        {isRepost ? (
          <>
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-300">
              Reposted by @{post.user?.username || "unknown"}
            </div>

            <PostHeader user={post.user} createdAt={post.createdAt} />

            <PostContent content={post.content} media={post.mediaUrls} />

            {hasTrade && <TradeCard trade={post.trade} />}

            <RepostWrapper>
              {originalPostAvailable ? (
                <>
                  <PostHeader
                    user={originalPost.user}
                    createdAt={originalPost.createdAt}
                  />
                  <PostContent
                    content={originalPost.content}
                    media={originalPost.mediaUrls}
                  />
                  {originalPost.trade && <TradeCard trade={originalPost.trade} />}
                </>
              ) : (
                <div className="rounded-xl bg-white/5 px-4 py-5 text-sm text-gray-400">
                  This original post is no longer available.
                </div>
              )}
            </RepostWrapper>

            <PostActions post={post} />
          </>
        ) : (
          <>
            <PostHeader user={post.user} createdAt={post.createdAt} />

            <PostContent content={post.content} media={post.mediaUrls} />

            {hasTrade && <TradeCard trade={post.trade} />}

            <PostActions post={post} />
          </>
        )}
      </div>
    </div>
  );
};

export default PostCard;
