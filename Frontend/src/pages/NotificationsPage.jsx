import { Bell } from "lucide-react";
import ComingSoonPage from "./ComingSoonPage";

const NotificationsPage = () => {
  return (
    <ComingSoonPage
      icon={Bell}
      title="Notifications"
      message="Notifications are not available yet."
      accent="blue"
    />
  );
};

export default NotificationsPage;
