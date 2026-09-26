import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { setAccessToken } from "@/lib/auth-token";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

// Everything the rest of the app can read/call via useAuth()
type AuthValue = {
  session: Session | null; // raw Supabase session (has the JWT, expiry, etc.)
  user: SupabaseUser | null; // raw Supabase user (id, email, from Google)
  appUser: User | null; // YOUR backend's version of the user (e.g. from your DB)
  loading: boolean; // true while we're still checking if a session exists
  googleConfigured: boolean; // whether Supabase env vars are set up
  justSignedIn: boolean; // flag: "user just completed sign-in" (for redirects/toasts)
  signingOut: boolean; // flag: "sign-out is in progress" (for loading states)
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  finishSignIn: () => void; // call this after you've reacted to justSignedIn
  finishSignOut: () => void; // call this after you've reacted to signingOut
};

// React Context: lets any component call useAuth() instead of passing props down
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // --- State ---
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Fetches the app's own user record from your backend, given a Supabase session
  const loadAppUser = async () => {
    try {
      const { user: fetchedAppUser } = await api.me();
      setAppUser(fetchedAppUser);
    } catch {
      setAppUser(null);
    }
  };

  // --- On mount: check for an existing session, then listen for changes ---
  useEffect(() => {
    // 1. On page load, check if the browser already has a saved session
    //    (e.g. user refreshed the page but was already logged in)
    const loadExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      const existingSession = data.session;

      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setAccessToken(existingSession?.access_token ?? null);

      if (existingSession) {
        await loadAppUser();
      } else {
        setAppUser(null);
      }

      setLoading(false); // we now know whether they're logged in or not
    };

    loadExistingSession();

    // 2. Subscribe to future auth events (login, logout, token refresh, etc.)
    //    This fires automatically whenever Supabase's auth state changes.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setAccessToken(newSession?.access_token ?? null);

        if (event === "SIGNED_IN") {
          setJustSignedIn(true);
        }

        if (newSession) {
          // We have a valid session — ask OUR backend who this user is
          // (this is separate from the Supabase/Google user data)
          await loadAppUser();
        } else {
          setAppUser(null);
        }
      },
    );

    // Cleanup: stop listening when this component unmounts
    return () => subscription.subscription.unsubscribe();
  }, []);

  // --- Actions ---

  // Kicks off the Google OAuth redirect flow
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) throw new Error(error.message);
  };

  // Signs the user out — clears local state immediately (optimistic),
  // then tells Supabase to actually invalidate the session
  const signOut = async () => {
    setSigningOut(true);

    // Clear local state right away so the UI updates instantly
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
    // Note: on success, signingOut stays true until finishSignOut() is called
    // (e.g. after a redirect/animation completes)
  };

  // Reset the "just signed in" flag once the consuming component has handled it
  const finishSignIn = () => setJustSignedIn(false);

  // Reset the "signing out" flag once the consuming component has handled it
  const finishSignOut = () => setSigningOut(false);

  // --- Provide everything to the rest of the app ---
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

// Hook for consuming the context — throws early if used outside the provider,
// so you get a clear error instead of a silent `undefined`
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
