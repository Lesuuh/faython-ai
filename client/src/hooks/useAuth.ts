import { authClient } from "@/auth";
import { Session } from "@neon/auth/types";
import { useEffect, useState } from "react";

export function useAuth() {
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);


  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await authClient.getSession();
        setUserSession(data?.session ?? null);
        setUser(data?.user ?? null);
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setUserSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      throw new Error("Google sign-in failed");
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    setUserSession(null);
  };

  return {
    user,
    userSession,
    session: userSession,
    loading,
    signInWithGoogle,
    signOut,
  };
}
