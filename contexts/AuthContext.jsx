import React, { createContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  signOut as firebaseSignOut,
  getUserProfile,
} from "@/lib/firebase/firebaseUtils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const firebaseUser = await getCurrentUser();
        setUser(firebaseUser);

        if (firebaseUser) {
          // Fetch the complete user profile from our database
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        setError(error.message);
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signOut,
    setUser,
    setUserProfile,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
