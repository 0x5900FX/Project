import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setAuthToken, removeAuthToken, getUserInfo } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUserInfo());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When token changes, update user info
    if (token) {
      setUser(getUserInfo());
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    setAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && user;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
