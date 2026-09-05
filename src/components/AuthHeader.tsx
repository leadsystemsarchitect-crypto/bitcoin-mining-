import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShieldCheck, User as UserIcon, LogOut, Loader2, Cloud, CloudCheck } from 'lucide-react';
import { GameState } from '../types';

interface AuthHeaderProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ gameState, setGameState }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load cloud save
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'save', 'game_state');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const cloudData = snap.data() as GameState;
            if (cloudData && cloudData.btcBalance !== undefined) {
              setGameState(cloudData);
            }
          }
        } catch (e) {
          console.error('Failed to load cloud save:', e);
        }
      }
    });
    return () => unsubscribe();
  }, [setGameState]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert('Sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleCloudSync = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      const docRef = doc(db, 'users', user.uid, 'save', 'game_state');
      await setDoc(docRef, gameState);
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      console.error('Sync failed:', e);
      setSyncStatus('idle');
      alert('Cloud sync failed.');
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
        Sign In with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
      <div className="flex items-center gap-2">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-zinc-700" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-xs font-mono text-zinc-300 hidden md:inline">{user.displayName || user.email}</span>
      </div>

      <button
        onClick={handleCloudSync}
        disabled={syncStatus === 'syncing'}
        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1 transition-all cursor-pointer"
        title="Sync state to Firestore cloud"
      >
        {syncStatus === 'syncing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
        {syncStatus === 'synced' ? 'Synced!' : 'Cloud Save'}
      </button>

      <button
        onClick={handleSignOut}
        className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-900 transition-all"
        title="Sign Out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
