import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("examly_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem("examly_token", token);
    localStorage.setItem("examly_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    const { token, ...userData } = res.data;
    localStorage.setItem("examly_token", token);
    localStorage.setItem("examly_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("examly_token");
    localStorage.removeItem("examly_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}