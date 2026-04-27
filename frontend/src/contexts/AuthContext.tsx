import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { AuthResponse, AuthState } from "../types/auth.types";

const AuthContext = createContext<AuthState | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      const userId = localStorage.getItem("userId");

      if (token && username && userId) {
        setUser(username);
        setUserId(userId);
      }

      setLoading(false);
    } catch (error) {
      console.error("Auth restore error:", error);
      setLoading(false);
    }
  }, []);

  const setAuth = ({ token, username, userId }: AuthResponse) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId);

    setUser(username);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    // localStorage.removeItem("accountObj");

    setUser(null);
    setUserId(null);
  };

  const value = {
    user,
    userId,
    setAuth,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};

export { AuthProvider, useAuth };
