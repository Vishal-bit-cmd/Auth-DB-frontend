// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from cookie on app load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile"); // cookies sent automatically
        setUser(res.data); // res.data includes role
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const res = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout"); // clears cookies
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
