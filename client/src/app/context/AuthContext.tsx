import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API_URL = "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isTokenValid = (t: string | null): boolean => {
    if (!t) return false;
    try {
      const base64Url = t.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const initialToken = localStorage.getItem("token");
  const valid = isTokenValid(initialToken);
  if (initialToken && !valid) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  }

  const [isAuthenticated, setIsAuthenticated] = useState(() => valid);
  const [username, setUsername] = useState(() => (valid ? localStorage.getItem("username") || "" : ""));
  const [token, setToken] = useState(() => (valid ? initialToken : null));

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUsername(data.username);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
