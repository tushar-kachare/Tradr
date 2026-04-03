import PortfolioList from "./PortfolioList";
import PostList from "./PostList";
import LikedPosts from "./LikedPosts";
import BookmarkPosts from "./BookmarkPosts";

const ProfileContent = ({ profile, activeTab }) => {
  if (activeTab === "portfolios") {
    return (
      <PortfolioList
        portfolio={profile.portfolio}
        username={profile.user.username}
      />
    );
  }

  if (activeTab === "posts") {
    return <PostList userId={profile.user.id} profile={profile} />;
  }

  if (activeTab === "likes") {
    return <LikedPosts userId={profile.user.id} />;
  }
  if (activeTab === "bookmarks") {
    return <BookmarkPosts userId={profile.user.id} />;
  }

  return null;
};

export default ProfileContent;
