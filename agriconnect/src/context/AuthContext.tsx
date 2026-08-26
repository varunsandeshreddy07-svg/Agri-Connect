import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi, setToken, clearToken } from "../api/client.js";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  organizationOrFarm: string;
  location: string;
  verificationLevel: string;
  phone: string;
  verifiedKyc?: boolean;
  verifiedLand?: boolean;
  verifiedSoil?: boolean;
  verifiedOrganic?: boolean;
  memberSince?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (data: {
    email: string; phone: string; password: string; name: string;
    role?: string; organizationOrFarm?: string; location?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem("agriconnect-token");
    if (token) {
      authApi.me()
        .then((data: any) => {
          setUser(data.user);
          // Also save to localStorage for backward compatibility
          localStorage.setItem("agriconnect-user", JSON.stringify({ type: data.user.role, currentUser: data.user }));
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const data: any = await authApi.login(emailOrPhone, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("agriconnect-user", JSON.stringify({ type: data.user.role, currentUser: data.user }));
  }, []);

  const register = useCallback(async (regData: {
    email: string; phone: string; password: string; name: string;
    role?: string; organizationOrFarm?: string; location?: string;
  }) => {
    const data: any = await authApi.register(regData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("agriconnect-user", JSON.stringify({ type: data.user.role, currentUser: data.user }));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data: any = await authApi.me();
      setUser(data.user);
      localStorage.setItem("agriconnect-user", JSON.stringify({ type: data.user.role, currentUser: data.user }));
    } catch {
      // Token might be expired
    }
  }, []);

  const updateUser = useCallback(async (profileData: any) => {
    const data: any = await authApi.updateProfile(profileData);
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data.user };
      localStorage.setItem("agriconnect-user", JSON.stringify({ type: updated.role, currentUser: updated }));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
