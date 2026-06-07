import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("sr_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get("/api/auth/me")
        .then((r) => setUser(r.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const r = await axios.post("/api/auth/login", { username, password });
    const { token: t, user: u } = r.data;
    localStorage.setItem("sr_token", t);
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (username, password) => {
    const r = await axios.post("/api/auth/register", { username, password });
    const { token: t, user: u } = r.data;
    localStorage.setItem("sr_token", t);
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("sr_token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
