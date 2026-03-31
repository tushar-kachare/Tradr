import PortfolioList from "./PortfolioList";
import PostList from "./PostList";
// import LikedPosts from "./LikedPosts";

const ProfileContent = ({ profile, activeTab }) => {
    console.log(activeTab);
    
  if (activeTab === "portfolios") {
    return <PortfolioList portfolio={profile.portfolio} />;
  }

  if (activeTab === "posts") {
    return <PostList userId={profile.user.id} profile={profile} />;
  }

  if (activeTab === "likes") {
    return <LikedPosts userId={profile.user.id} />;
  }

  return null;
};

export default ProfileContent;