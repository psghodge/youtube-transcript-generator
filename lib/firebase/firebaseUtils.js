import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUser as createDbUser, getUser } from "@/database/db";

export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create a user in our database
    await createDbUser({
      id: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || "",
      photoURL: userCredential.user.photoURL || "",
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

export const getUserProfile = async (userId) => {
  try {
    return await getUser(userId);
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Create/update user in our database
    await createDbUser({
      id: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || "",
      photoURL: result.user.photoURL || "",
    });

    return result.user;
  } catch (error) {
    throw error;
  }
};
