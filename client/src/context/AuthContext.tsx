// import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// import type { Session, User } from "@supabase/supabase-js";
// import { setAccessToken } from "@/lib/auth-token";
// import { supabase, supabaseConfigured } from "@/lib/supabase";

// type AuthValue = {
//   session: Session | null;
//   user: User | null;
//   loading: boolean;
//   googleConfigured: boolean;
//   signInWithGoogle: () => Promise<void>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthValue | null>(null);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let active = true;

//     void supabase.auth.getSession().then(({ data, error }) => {
//       if (error) console.error("[auth] Could not restore session:", error.message);
//       if (!active) return;
//       setSession(data.session);
//       setAccessToken(data.session?.access_token ?? null);
//       setLoading(false);
//     });

//     const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
//       setSession(nextSession);
//       setAccessToken(nextSession?.access_token ?? null);
//       setLoading(false);
//     });

//     return () => {
//       active = false;
//       data.subscription.unsubscribe();
//     };
//   }, []);

//   async function signInWithGoogle() {
//     if (!supabaseConfigured) {
//       throw new Error("Sign-in is unavailable. Configure the Supabase URL and anon key.");
//     }

//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: { redirectTo: window.location.origin },
//     });
//     if (error) throw new Error(error.message);
//   }

//   async function signOut() {
//     const { error } = await supabase.auth.signOut();
//     if (error) throw new Error(error.message);
//     setAccessToken(null);
//     setSession(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         session,
//         user: session?.user ?? null,
//         loading,
//         googleConfigured: supabaseConfigured,
//         signInWithGoogle,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// }
