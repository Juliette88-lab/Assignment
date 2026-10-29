import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

const AuthContext = createContext(null);

async function getStoredValue(key) {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return await SecureStore.getItemAsync(key);
}

async function saveStoredValue(key, value) {
  if (Platform.OS === "web") {
    if (!globalThis.localStorage) {
      throw new Error("Browser storage is unavailable.");
    }

    globalThis.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeStoredValue(key) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const savedToken = await getStoredValue("accessToken");
        const savedUser = await getStoredValue("userData");

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);

          if (active) {
            setToken(savedToken);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Could not restore session:", error);

        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (userData, accessToken) => {
    if (!userData || !accessToken) {
      throw new Error("User data and access token are required.");
    }

    await saveStoredValue("accessToken", accessToken);
    await saveStoredValue("userData", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const updateUser = async (updatedUser) => {
    const newUser = {
      ...user,
      ...updatedUser,
    };

    await saveStoredValue("userData", JSON.stringify(newUser));
    setUser(newUser);

    return newUser;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);

    try {
      await Promise.all([
        removeStoredValue("accessToken"),
        removeStoredValue("userData"),
      ]);
    } catch (error) {
      console.error("Could not clear saved session:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
