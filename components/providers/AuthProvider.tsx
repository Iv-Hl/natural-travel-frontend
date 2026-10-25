"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { logoutUser } from "@/lib/api/logout";

export interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  savedArticles: string[];
}

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  updateUser: (user: CurrentUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({
  children,
  hasSessionCookie,
}: Readonly<{
  children: React.ReactNode;
  hasSessionCookie: boolean;
}>) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(hasSessionCookie);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth("/api/users/me");
      if (response.ok) {
        setUser((await response.json()) as CurrentUser);
      } else if (response.status === 401) {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((nextUser: CurrentUser) => {
    setUser(nextUser);
  }, []);

  useEffect(() => {
    if (hasSessionCookie) void refreshAuth();
  }, [hasSessionCookie, refreshAuth]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      router.replace("/auth/login");
      router.refresh();
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [router]);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    router.replace("/");
    router.refresh();
  }, [router]);

  const updateSavedStory = useCallback(
    (userId: string, storyId: string, isSaved: boolean) => {
      setUser((current) => {
        if (!current || current._id !== userId) return current;

        const savedArticles = current.savedArticles ?? [];
        return {
          ...current,
          savedArticles: isSaved
            ? [...new Set([...savedArticles, storyId])]
            : savedArticles.filter((id) => id !== storyId),
        };
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ user, isLoading, refreshAuth, updateUser, logout }),
    [user, isLoading, refreshAuth, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
