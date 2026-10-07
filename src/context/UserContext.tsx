'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  DemoUser,
  getStoredDemoUser,
  saveDemoUser,
  loginWithName,
  logout as authLogout,
  isAuthenticated as checkIsAuthenticated,
} from '@/services/auth.service';

export interface UserContextType {
  user: DemoUser | null;
  mode: 'user' | 'organization';
  setMode: (mode: 'user' | 'organization') => void;
  login: (name?: string) => Promise<{ success: boolean; user?: DemoUser; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const defaultUserContext: UserContextType = {
  user: null,
  mode: 'user',
  setMode: () => {},
  login: async () => ({ success: false, error: 'Context not initialized' }),
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
};

const UserContext = createContext<UserContextType>(defaultUserContext);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from client storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredDemoUser();
      if (stored && stored.loggedIn) {
        const savedMode = (localStorage.getItem('brandguard_mode') as 'user' | 'organization') || stored.mode || 'user';
        setUser({ ...stored, mode: savedMode });
      }
      setIsLoading(false);
    }
  }, []);

  const mode: 'user' | 'organization' = user?.mode || 'user';

  const setMode = useCallback((newMode: 'user' | 'organization') => {
    setUser((prev) => {
      const updated: DemoUser = prev
        ? { ...prev, mode: newMode }
        : { name: 'Demo User', mode: newMode, loggedIn: true };
      saveDemoUser(updated);
      return updated;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('brandguard_mode', newMode);
      window.dispatchEvent(new CustomEvent('brandguard:mode-changed', { detail: { mode: newMode } }));
    }
  }, []);

  const login = useCallback(async (name?: string) => {
    const res = await loginWithName(name);
    if (res.success && res.user) {
      setUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('brandguard_mode', 'user');
        window.dispatchEvent(new CustomEvent('brandguard:mode-changed', { detail: { mode: 'user' } }));
      }
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error };
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      mode,
      setMode,
      login,
      logout,
      isAuthenticated: Boolean(user?.loggedIn || checkIsAuthenticated()),
      isLoading,
    }),
    [user, mode, setMode, login, logout, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  return context || defaultUserContext;
}
