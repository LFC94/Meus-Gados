import { STORAGE_KEYS } from "@/constants/const";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FirebaseAuthTypes,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { subscribeToStorageChanges } from "@/lib/storage";
import { syncService } from "@/lib/sync";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<FirebaseAuthTypes.UserCredential>;
  signOut: () => Promise<void> | Promise<null>;
  syncData: () => Promise<{ success: boolean; error?: string }>;
  isSyncing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  });

  function handleAuthStateChanged(user: any) {
    setUser(user);
    setLoading(false);
  }

  useEffect(() => {
    onAuthStateChanged(getAuth(), handleAuthStateChanged);
  }, []);

  const initialSyncDone = useRef(false);

  useEffect(() => {
    if (user && !initialSyncDone.current && !isSyncing) {
      initialSyncDone.current = true;
      syncData();
    }
    if (!user) {
      initialSyncDone.current = false;
    }
  }, [user, isSyncing]);

  useEffect(() => {
    if (!user) return;

    let timer: any;

    // Trigger sync when local storage changes (debounced)
    const unsubscribe = subscribeToStorageChanges(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isSyncing) syncData();
      }, 10000); // 10 second delay for auto-sync after changes
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [user, isSyncing]);

  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const signInResult = await GoogleSignin.signIn();
    console.log(signInResult);

    let idToken = signInResult.data?.idToken;

    if (!idToken) {
      throw new Error("No ID token found");
    }

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(getAuth(), googleCredential);
  };

  const signOutG = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    return signOut(getAuth()).then(() => console.log("user signed out"));
  };

  const syncData = async () => {
    setIsSyncing(true);
    try {
      return await syncService.syncAll();
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut: signOutG,
    syncData,
    isSyncing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
