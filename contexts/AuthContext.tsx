import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_roles: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  role: "admin" | "user" | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string, displayName: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (userId: string, userEmail?: string, userDisplayName?: string) => {
    // Fallback from JWT metadata (aplicado imediatamente para evitar flash)
    setProfile({
      id: userId,
      email: userEmail || "",
      full_name: userDisplayName || "",
      user_roles: null,
    });

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email || userEmail || "",
          full_name: profileData.full_name || userDisplayName || "",
          user_roles: profileData.user_roles || null,
        });

        if (profileData.user_roles) {
          setRole(profileData.user_roles as "admin" | "user");
        } else {
          setRole("user");
        }
      } else {
        if (error) {
          console.warn("Profile fetch error:", error.message);
        } else {
          console.log("Profile not found, creating basic profile for user:", userId);
        }
        const newProfile = {
          id: userId,
          email: userEmail || "",
          full_name: userDisplayName || userEmail?.split("@")[0] || "",
          user_roles: "user",
        };
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile);

        if (!insertError) {
          setProfile({
            id: userId,
            email: newProfile.email,
            full_name: newProfile.full_name,
            user_roles: newProfile.user_roles,
          });
          setRole("user");
        } else {
          console.error("Failed to create profile:", insertError.message);
          setRole(null);
        }
      }
    } catch (e) {
      console.error("fetchProfileAndRole exception:", e);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchProfileAndRole(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.display_name
            );
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.display_name
        );
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user,
        profile,
        role,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuth: AuthContextType = {
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  loading: false,
  login: async () => ({ ok: false, error: "AuthProvider not mounted" }),
  signup: async () => ({ ok: false, error: "AuthProvider not mounted" }),
  logout: async () => {},
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (typeof console !== "undefined") {
      console.warn("useAuth called outside AuthProvider — using default context");
    }
    return defaultAuth;
  }
  return ctx;
}
