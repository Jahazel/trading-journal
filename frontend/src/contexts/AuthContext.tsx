import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthResponse, AuthState } from "../types/auth.types";
import { logoutUser } from "../api/api";

const AuthContext = createContext<AuthState | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const username = localStorage.getItem("username");
      const userId = localStorage.getItem("userId");

      if (username && userId) {
        setUser(username);
        setUserId(userId);
      }

      setLoading(false);
    } catch (error) {
      console.error("Auth restore error:", error);
      setLoading(false);
    }
  }, []);

  const setAuth = ({ username, userId }: AuthResponse) => {
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId);

    setUser(username);
    setUserId(userId);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // proceed with local cleanup even if server call fails
    }

    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    queryClient.clear();
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
