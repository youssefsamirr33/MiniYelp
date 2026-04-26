import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "miniyelp.auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: "", user: null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      async login(payload) {
        const response = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setAuth(response);
        return response;
      },
      async register(payload) {
        const response = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setAuth(response);
        return response;
      },
      async forgotPassword(payload) {
        return apiRequest("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async resetPassword(payload) {
        return apiRequest("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      async fetchMe() {
        if (!auth.token) {
          return null;
        }

        const response = await apiRequest("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        setAuth((current) => ({ ...current, user: response }));
        return response;
      },
      logout() {
        setAuth({ token: "", user: null });
      }
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
