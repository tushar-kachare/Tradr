import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProfile } from "../api/profileApi";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileContent from "../components/profile/ProfileContent";
import { useAuth } from "../context/AuthContext";

const loadProfileData = async ({ username, setLoading, setError, setProfile }) => {
  try {
    setLoading(true);
    setError(null);
    const res = await fetchProfile(username);
    setProfile(res);
  } catch {
    setError("Failed to load Profile");
  } finally {
    setLoading(false);
  }
};

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("portfolios");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = async () =>
    loadProfileData({ username, setLoading, setError, setProfile });

  useEffect(() => {
    loadProfileData({ username, setLoading, setError, setProfile });
  }, [username]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-800 rounded-lg mb-4"></div>
        <div className="h-10 bg-gray-800 rounded mb-3"></div>
        <div className="h-40 bg-gray-800 rounded"></div>
      </div>
    );
  }

  // ❌ Error UI
  if (error) {
    return <div className="text-center text-red-400 mt-10">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <ProfileHeader profile={profile} />
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} user={profile.user}/>
      <ProfileContent
        activeTab={activeTab}
        profile={profile}
        isOwner={currentUser?.id === profile?.user?.id}
        onRefreshProfile={refreshProfile}
      />
    </div>
  );
};
export default ProfilePage;
