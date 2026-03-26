import {
  Children,
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoding] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await API.get("/users/me");

      setUser(res.data.user);
      console.log(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoding(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
