import { useNavigate } from "react-router-dom";
import PostActions from "./PostActions";
import PostContent from "./PostContent";
import PostHeader from "./PostHeader";
import RepostWrapper from "./RepostWrapper";
import TradeCard from "./TradeCard";

const PostCard = ({ post, disableNavigation = false }) => {
  const navigate = useNavigate();
  const isRepost = post.postType === "repost";
  const hasTrade = Boolean(post.trade);
  const originalPost = post.originalPost;
  const originalPostAvailable = Boolean(originalPost);

  const handleCardClick = (event) => {
    if (disableNavigation) {
      return;
    }

    const interactiveElement = event.target.closest(
      "button, a, input, textarea, video, [data-stop-post-nav]",
    );

    if (interactiveElement) {
      return;
    }

    navigate(`/post/${post.id}`);
  };

  return (
    <div className="">
      <div
        onClick={handleCardClick}
        className={`rounded-2xl border border-white/10 bg-[#0f1117] p-4 shadow-md shadow-black/20 ${
          disableNavigation
            ? ""
            : " transition cursor-pointer hover:bg-[#12151c]"
        }`}
      >
        <div className="flex flex-col gap-1">
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
                  <div
                    data-stop-post-nav // already stops outer card nav
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/post/${originalPost.id}`);
                    }}
                    className="cursor-pointer"
                  >
                    <PostHeader
                      user={originalPost.user}
                      createdAt={originalPost.createdAt}
                    />
                    <PostContent
                      content={originalPost.content}
                      media={originalPost.mediaUrls}
                    />
                    {originalPost.trade && (
                      <TradeCard trade={originalPost.trade} />
                    )}
                  </div>
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

              {hasTrade && (
                <TradeCard
                  trade={post.trade}
                  onClick={() =>
                    navigate(`/portfolio/${post.trade.portfolioId}`)
                  }
                />
              )}

              <PostActions post={post} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
