import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { setAccessToken } from "@/lib/auth-token";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthValue = {
  session: Session | null;
  user: SupabaseUser | null;
  appUser: User | null;
  loading: boolean;
  googleConfigured: boolean;
  justSignedIn: boolean;
  signingOut: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  finishSignIn: () => void;
  finishSignOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);
      setAccessToken(s?.access_token ?? null);
      setLoading(false);
      if (!s) setAppUser(null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setAccessToken(s?.access_token ?? null);
      if (event === "SIGNED_IN") setJustSignedIn(true);
      if (s) {
        api.me().then(({ user: u }) => setAppUser(u)).catch(() => setAppUser(null));
      } else {
        setAppUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    setSigningOut(true);
    setAccessToken(null);
    setSession(null);
    setUser(null);
    setAppUser(null);
    setJustSignedIn(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      throw new Error(error.message);
    }
  };

  const finishSignIn = () => setJustSignedIn(false);
  const finishSignOut = () => setSigningOut(false);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        appUser,
        loading,
        googleConfigured: supabaseConfigured,
        justSignedIn,
        signingOut,
        signInWithGoogle,
        signOut,
        finishSignIn,
        finishSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
