import { db } from "@/lib/firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { User } from "./models/user";

const USERS_COLLECTION = "users";

export async function getUser(userId) {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      return null;
    }
    return User.fromFirestore(userDoc);
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return User.fromFirestore(querySnapshot.docs[0]);
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

export async function createUser(userData) {
  try {
    // Validate user data
    User.validate(userData);

    // Check if user already exists
    const existingUser = await getUser(userData.id);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create new user instance
    const user = new User(userData);

    // Save to Firestore
    await setDoc(doc(db, USERS_COLLECTION, user.id), user.toFirestore());

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(userId, updateData) {
  try {
    const user = await getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user data
    const updatedData = {
      ...user,
      ...updateData,
      updatedAt: new Date(),
    };

    // Save to Firestore
    await setDoc(doc(db, USERS_COLLECTION, userId), updatedData);

    return new User(updatedData);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
