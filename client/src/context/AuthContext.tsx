import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured, demoMode } from "@/lib/supabase";
import { setAccessToken } from "@/lib/auth-token";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthValue = {
  session: Session | null;
  user: SupabaseUser | null;
  appUser: User | null;
  loading: boolean;
  configured: boolean;
  demoMode: boolean;
  isGoogleConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshAppUser: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

// Preview mode is active when Supabase envs aren't wired up yet.
// Any credentials create a local demo session so the UI can be explored
// without a real backend. It switches off automatically once Supabase envs
// are configured, because demoMode = !supabaseConfigured.
const DEMO_MODE = demoMode;
export const DEMO_EMAIL = "demo@faython.local";
export const DEMO_PASSWORD = "demo1234";
const DEMO_ACCESS_TOKEN = "demo-access-token";
const DEMO_USER_ID = "demo-user-0001";
const DEMO_STORAGE_KEY = "faython:demo-session";

function readDemoSessionName(): string | null {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { name?: string | null };
    return typeof parsed.name === "string" ? parsed.name : null;
  } catch {
    return null;
  }
}

function hasDemoSession(): boolean {
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function persistDemoSession(name?: string) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ name: name || null }));
  } catch {
    // storage unavailable — session stays in memory
  }
}

function demoUser(fullName?: string): SupabaseUser {
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    user_metadata: { full_name: fullName || "Demo Student" },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as unknown as SupabaseUser;
}

function demoSession(fullName?: string): Session {
  return { access_token: DEMO_ACCESS_TOKEN, user: demoUser(fullName) } as unknown as Session;
}

function demoAppUser(fullName?: string): User {
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    name: fullName || "Demo Student",
    role: "STUDENT",
    emailVerified: true,
    avatarUrl: null,
    notificationsOn: true,
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshAppUser() {
    if (DEMO_MODE) {
      setAppUser(demoAppUser());
      return;
    }
    if (!session) {
      setAppUser(null);
      return;
    }
    try {
      const { user: u } = await api.me();
      setAppUser(u);
    } catch {
      setAppUser(null);
    }
  }

  useEffect(() => {
    if (DEMO_MODE) {
      if (hasDemoSession()) {
        const name = readDemoSessionName() || undefined;
        setSession(demoSession(name));
        setUser(demoUser(name));
        setAccessToken(DEMO_ACCESS_TOKEN);
        setAppUser(demoAppUser(name));
      } else {
        setSession(null);
        setUser(null);
        setAccessToken(null);
        setAppUser(null);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);
      setAccessToken(s?.access_token ?? null);
      setLoading(false);
      if (!s) setAppUser(null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setAccessToken(s?.access_token ?? null);
      if (s) {
        api.me().then(({ user: u }) => setAppUser(u)).catch(() => setAppUser(null));
      } else {
        setAppUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        throw new Error("Invalid email or password");
      }
      persistDemoSession();
      setSession(demoSession());
      setUser(demoUser());
      setAccessToken(DEMO_ACCESS_TOKEN);
      setAppUser(demoAppUser());
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signUp = async (name: string, email: string, password: string) => {
    if (DEMO_MODE) {
      persistDemoSession(name);
      setSession(demoSession(name));
      setUser(demoUser(name));
      setAccessToken(DEMO_ACCESS_TOKEN);
      setAppUser(demoAppUser(name));
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signInWithGoogle = async () => {
    if (DEMO_MODE) {
      persistDemoSession();
      setSession(demoSession());
      setUser(demoUser());
      setAccessToken(DEMO_ACCESS_TOKEN);
      setAppUser(demoAppUser());
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signOut = async () => {
    setAccessToken(null);
    setSession(null);
    setUser(null);
    setAppUser(null);
    if (DEMO_MODE) {
      try {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
      } catch {
        // storage unavailable
      }
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (DEMO_MODE) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(translateAuthError(error.message));
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        appUser,
        loading,
        configured: supabaseConfigured,
        demoMode: DEMO_MODE,
        isGoogleConfigured: supabaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        refreshAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Invalid email or password";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "An account with this email already exists.";
  if (lower.includes("email not confirmed")) return "Please confirm your email before signing in.";
  return message;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}