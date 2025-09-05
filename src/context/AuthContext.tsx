import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { AUTH_TOKEN_KEY } from "../config";
import { authService } from "../services/authService";
import { toast } from "react-toastify";

const USER_DATA_KEY = "user_data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUserData = localStorage.getItem(USER_DATA_KEY);

      console.log("Auth token from localStorage:", token);
      console.log("Saved user data from localStorage:", savedUserData);
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Restore user data from localStorage if available
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
          console.log("User data restored from localStorage");
        } catch (parseError) {
          console.error("Failed to parse saved user data:", parseError);
          localStorage.removeItem(USER_DATA_KEY);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Authentication check failed:", error);
      // Don't clear storage here - only clear on explicit logout or 401 from API
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Check if user is logged in

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the real API
      const response = await authService.login({ username, password });
      console.log("Login response:", response);

      // Store the authToken from response
      localStorage.setItem(AUTH_TOKEN_KEY, response.authToken);
      console.log("Token stored in localStorage:", response.authToken);

      // Set user data from the nested user object
      const userData = response.user;

      // Store user data in localStorage for persistence
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log("User data stored in localStorage:", userData);

      setUser(userData);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setUser(null);
  };

  // Function to handle token expiration from API calls
  const handleTokenExpired = () => {
    console.log("Token expired, logging out user");
    logout();
  };

  // Expose handleTokenExpired globally for API interceptor
  useEffect(() => {
    (window as any).handleTokenExpired = handleTokenExpired;
    return () => {
      delete (window as any).handleTokenExpired;
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
