import React, { createContext, useContext, useState, useEffect } from "react";
import { UserDb } from "../models/types";
import { AuthController } from "../controllers/AuthController";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { useLoading } from "./LoadingContext";
import { useSnackbar } from "./SnackbarContext";
import { auth } from "../firebase/config";

interface AuthContextType {
  user: UserDb | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDb | null>(null);
  const [loading, setLoading] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const unsubscribe = AuthController.onAuthStateChange(
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userData = await AuthController.getCurrentUser(
              firebaseUser.uid
            );

            if (userData) {
              setUser(userData);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
            showSnackbar(
              "Une erreur est survenue, veuillez contacter le support",
              "error"
            );
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      showLoading();

      const userData = await AuthController.signIn(email, password);

      await setPersistence(auth, browserLocalPersistence);
      setUser(userData);
      showSnackbar("Connexion réussie", "success");
    } catch (error) {
      showSnackbar("Échec de la connexion", "error");
      throw error;
    } finally {
      hideLoading();
    }
  };

  const signInWithGoogle = async () => {
    try {
      showLoading();
      const userData = await AuthController.signInWithGoogle();
      await setPersistence(auth, browserLocalPersistence);

      setUser(userData);
      showSnackbar("Successfully signed in with Google", "success");
    } catch (error) {
      showSnackbar("Failed to sign in with Google", "error");
      throw error;
    } finally {
      hideLoading();
    }
  };

  const signOut = async () => {
    try {
      showLoading();
      await AuthController.signOut();
      setUser(null);
      showSnackbar("Successfully signed out", "success");
    } catch (error) {
      showSnackbar("Failed to sign out", "error");
      throw error;
    } finally {
      hideLoading();
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      showLoading();
      const userData = await AuthController.signUp(
        email,
        password,
        displayName
      );
      setUser(userData);
      showSnackbar("Successfully created account", "success");
    } catch (error) {
      showSnackbar("Failed to create account", "error");
      throw error;
    } finally {
      hideLoading();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signInWithGoogle, signOut, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
