import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import api, { authAPI, setTokens, clearTokens } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper pour choisir le bon stockage
  const getStorage = () => {
    return localStorage.getItem("accessToken") ? localStorage : sessionStorage;
  };

  // Initialisation auth
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        let storedToken, storedRefreshToken, storedUser, storageUsed;

        [localStorage, sessionStorage].some((storage) => {
          storedToken = storage.getItem("accessToken");
          storedRefreshToken = storage.getItem("refreshToken");
          storedUser = storage.getItem("user");
          if (storedToken && storedRefreshToken && storedUser) {
            storageUsed = storage;
            return true;
          }
          return false;
        });
        if (storedToken && storedRefreshToken) {
          setTokens(storedToken, storedRefreshToken);  // remet en mémoire
        }

        if (storedToken && storedRefreshToken && storedUser) {
          setTokens(storedToken, storedRefreshToken);
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          try {
            const response = await authAPI.me();
            setUser(response.data);
            storageUsed.setItem("user", JSON.stringify(response.data));
          } catch {
            handleLogout();
          }
        }
      } catch {
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
  
    initializeAuth();
  }, []);

  // Login
  const login = useCallback(
    async (username, password, rememberMe = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authAPI.login({ username, password });

        if (!response.data.access || !response.data.refresh) {
          throw new Error("Tokens not received");
        }

        const tokens = {
          access: response.data.access,
          refresh: response.data.refresh,
        };

        let userData = response.data.user || response.data;

        // Stocker tokens pour API
        setTokens(tokens.access, tokens.refresh);

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("accessToken", tokens.access);
        storage.setItem("refreshToken", tokens.refresh);
        storage.setItem("user", JSON.stringify(userData));

        // Rafraîchir user
        try {
          const meResponse = await authAPI.me();
          userData = meResponse.data;
          storage.setItem("user", JSON.stringify(userData));
        } catch {
          console.warn("Could not fetch fresh user data");
        }

        setToken(tokens.access);
        setUser(userData);

        return userData;
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Login failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (userData) => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint =
          userData.userType === "client"
            ? "/auth/register/client/"
            : "/auth/register/technician/";
  
        const { userType, ...registrationData } = userData;
  
        const response = await api.post(endpoint, registrationData);
  
        // Récupérer les tokens et user
        const { access, refresh, user } = response.data;
  
        // Stocker les tokens pour les requêtes futures
        setTokens(access, refresh);
  
        const storage = localStorage; // ou sessionStorage selon besoin
        storage.setItem("accessToken", access);
        storage.setItem("refreshToken", refresh);
        storage.setItem("user", JSON.stringify(user));
  
        setToken(access);
        setUser(user);
  
        toast.success("Inscription réussie ! Bienvenue 😄");
  
        return user; // retourne l’utilisateur connecté
      } catch (err) {
        const errorData = err.response?.data;
        let errorMessage = "Registration failed";
  
        if (errorData) {
          if (typeof errorData === "object") {
            errorMessage = Object.values(errorData).flat().join(", ");
          } else {
            errorMessage = errorData.toString();
          }
        }
  
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  
  // Password reset
  const requestPasswordReset = async (email) => {
    try {
      await api.post("/auth/password/reset/", { email });
      return true;
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Impossible d'envoyer le mail"
      );
    }
  };

  const confirmPasswordReset = async (uid, token, newPassword) => {
    try {
      await api.post("/auth/password/reset/confirm/", {
        uid,
        token,
        new_password1: newPassword,
        new_password2: newPassword,
      });
      return true;
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Impossible de réinitialiser le mot de passe"
      );
    }
  };

  // Logout
  const handleLogout = useCallback(() => {
    clearTokens();
    setUser(null);
    setToken(null);
    setError(null);

    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem("accessToken");
      storage.removeItem("refreshToken");
      storage.removeItem("user");
    });
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (token) await authAPI.logout();
    } catch {
      console.warn("Logout API failed");
    } finally {
      handleLogout();
      setIsLoading(false);
      window.location.href = "/login";
    }
  }, [token, handleLogout]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      register,
      requestPasswordReset,
      confirmPasswordReset,
      isLoading,
      isAuthenticated: !!user && !!token,
      error,
    }),
    [user, token, login, logout, register, isLoading, error]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
