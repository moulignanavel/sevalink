import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, signOut, doc, getDoc } from '../firebase';

const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          setAuthReady(true);
          return;
        }
        let role = 'volunteer';
        let profileCompleted = false;
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            role = snap.data().role;
            profileCompleted = snap.data().profileCompleted ?? false;
          }
        } catch (e) {
          console.warn('[AuthContext] Could not fetch role:', e);
        }
        setUser({
          uid:   firebaseUser.uid,
          name:  firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role,
          profileCompleted,
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, setUser, authReady, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
