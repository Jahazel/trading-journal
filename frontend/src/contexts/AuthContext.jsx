import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (token && username) {
        setUser(username);
      }

      setLoading(false);
    } catch (error) {
      console.error("Auth restore error:", error);
      setLoading(false);
    }
  }, []);

  const setAuth = ({ token, username }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setUser(username);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  };

  const value = {
    user,
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
