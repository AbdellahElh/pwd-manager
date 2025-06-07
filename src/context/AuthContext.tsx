// src/context/AuthContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { post, setAuthToken } from "../data/apiClient";
import { LoginResponse, User } from "../models/User";
import { getUserEncryptionKey } from "../utils/cryptoUtils";
import { createEncryptedImageFormData } from "../utils/imageEncryptionUtils";

interface AuthContextValue {
  user: User | null;
  login: (email: string, selfie?: Blob) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  encryptionKey: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const json = localStorage.getItem("user");
    if (json) {
      try {
        const u: User = JSON.parse(json);
        if (u.token) {
          setAuthToken(u.token);
        }
        return u;
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  const isLoggedIn = !!user;

  // Generate encryption key when user is available
  const encryptionKey = useMemo(() => {
    if (!user) return null;
    return getUserEncryptionKey(user.id, user.email);
  }, [user]);
  const login = async (email: string, selfie?: Blob) => {
    let formData: FormData;

    if (selfie) {
      // Create a temporary encryption key for login
      // We use a combination of email and app secret to derive this key
      const tempEncryptionKey = `pwd-manager-temp-${email}-${
        import.meta.env.VITE_SECRET_KEY
      }`;

      // Create encrypted form data with the selfie
      formData = await createEncryptedImageFormData(
        selfie,
        tempEncryptionKey,
        "selfie",
        { email }
      );
    } else {
      // If no selfie is provided, just send the email
      formData = new FormData();
      formData.append("email", email);
    }

    const response = await post<FormData, LoginResponse>(
      "/users/login",
      formData
    );
    const loggedInUser: User = {
      id: response.user.id,
      email: response.user.email,
      token: response.token,
    };
    setAuthToken(response.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoggedIn, encryptionKey }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
