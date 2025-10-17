import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(
    localStorage.getItem("receiptoverse_token")
  );

  // API Configuration
  const API_BASE = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL ||
      "https://ReceiptoVerse-production.up.railway.app"
    : "http://localhost:3000";

  // Load user profile from token
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        console.log("✅ User profile loaded:", data.user.handle);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("receiptoverse_token");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Don't clear token on network errors, user might be offline
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, token]);

  // Initialize user session
  useEffect(() => {
    if (token) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [token, loadUserProfile]);

  // Register new user
  const register = async (
    email,
    password,
    desiredHandle,
    displayName,
    recaptchaToken
  ) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          desiredHandle,
          displayName,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user requires verification
        if (data.user && data.user.requiresVerification) {
          console.log(
            "✅ User registered successfully - verification required:",
            data.user.handle
          );
          return {
            success: true,
            user: data.user,
            requiresVerification: true,
            message: data.message,
          };
        } else if (data.token) {
          // Old flow - user is immediately authenticated
          localStorage.setItem("receiptoverse_token", data.token);
          setToken(data.token);
          setUser(data.user);
          setIsAuthenticated(true);

          console.log("✅ User registered successfully:", data.user.handle);
          return { success: true, user: data.user };
        }
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      console.log("🔍 API_BASE:", API_BASE);
      console.log("🔍 Attempting login to:", `${API_BASE}/api/users/login`);
      console.log("🔍 Environment mode:", import.meta.env.MODE);
      console.log("🔍 Is production:", import.meta.env.PROD);

      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and set user
        localStorage.setItem("receiptoverse_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);

        console.log("✅ User logged in successfully:", data.user.handle);
        return { success: true, user: data.user };
      } else {
        // Check if this is an email verification issue
        if (data.code === "EMAIL_NOT_VERIFIED") {
          return {
            success: false,
            error: data.error || "Email verification required",
            code: data.code,
            email: data.email,
            requiresVerification: true,
          };
        }
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email with code
  const verifyEmail = async (email, code) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE}/api/users/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and set user after successful verification
        localStorage.setItem("receiptoverse_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);

        console.log("✅ Email verified successfully:", data.user.handle);
        return { success: true, user: data.user, message: data.message };
      } else {
        return {
          success: false,
          error: data.error || "Verification failed",
          code: data.code,
        };
      }
    } catch (error) {
      console.error("Email verification error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async (email) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE}/api/users/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Verification code resent to:", email);
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          error: data.error || "Failed to resend code",
          code: data.code,
        };
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("receiptoverse_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log("✅ User logged out");
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        console.log("✅ Profile updated successfully");
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || "Update failed" };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  // Get user statistics
  const getUserStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, stats: data.stats };
      } else {
        return { success: false, error: "Failed to load statistics" };
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  // Refresh user data
  const refreshUser = () => {
    if (token) {
      loadUserProfile();
    }
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    token,

    // Actions
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationCode,
    updateProfile,
    getUserStats,
    refreshUser,

    // API Base for other components
    API_BASE,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
