import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { UserDb } from "../models/types";
import { AppService } from "../services/app.service";

export class AuthController {
  static async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserDb["role"] = "client"
  ): Promise<UserDb> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user: UserDb = {
        ...AppService.inititalUser,
        uid: userCredential.user.uid,
        email,
        displayName: displayName || "",
        role,
      };

      await setDoc(doc(db, "users", user.id), user);
      return user;
    } catch (error) {
      console.error("Sign up error:", error);
      throw new Error("Failed to create user");
    }
  }

  static async signIn(email: string, password: string): Promise<UserDb> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }

      return userDoc.data() as UserDb;
    } catch (error) {
      console.error("Sign in error:", error);
      throw new Error("Failed to sign in");
    }
  }

  static async signInWithGoogle(): Promise<UserDb> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDoc = await AppService.getUserByUid(userCredential.user.uid);

      if (!userDoc) {
        // Create new user document if it doesn't exist
        const newUser: UserDb = {
          ...AppService.inititalUser,
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          photoURL: userCredential.user.photoURL || "",
          displayName: userCredential.user.displayName || "",
        };
        await setDoc(doc(db, "users", newUser.id), newUser);
        return newUser;
      }

      return userDoc;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw new Error("Failed to sign in with Google");
    }
  }

  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  }

  static onAuthStateChange(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, callback);
  }

  static async getCurrentUser(uid: string): Promise<UserDb> {
    try {
      const userDoc = await AppService.getUserByUid(uid);
      if (!userDoc) {
        this.signOut();
        console.error("User document not found for uid:", uid);
        throw new Error("User not found");
      }
      return userDoc;
    } catch (error) {
      console.error("Get current user error:", error);
      throw new Error("Failed to get user data");
    }
  }
}
