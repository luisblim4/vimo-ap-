import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, API_BASE } from "../api/client";
import { deleteToken, getToken, saveToken } from "../utils/token";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";

type User = { id: string; email: string } | null;

interface AuthCtx {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      // Ocultar botones de Android y forzar pantalla completa
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("inset-swipe");
      } catch (err) {
        console.log("Error configurando NavigationBar:", err);
      }

      // Leer la memoria física
      const session = await AsyncStorage.getItem("userSession");
      const savedEmail = await AsyncStorage.getItem("userData");

      if (API_BASE) {
        const token = await getToken();
        if (token) {
          try {
            const me = await api.me();
            setUser(me);
            // Sincronizar memoria física
            await AsyncStorage.setItem("userSession", "activo");
            await AsyncStorage.setItem("userData", me.email);
            return;
          } catch (err) {
            console.log("Error en bootstrap API, intentando fallback local:", err);
          }
        }
      }

      // Fallback local o modo offline/mock
      if (session === "activo" && savedEmail) {
        setUser({ id: "local", email: savedEmail });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("Error en bootstrap:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email: string, password: string) => {
    try {
      if (API_BASE) {
        const data = await api.login(email, password);
        await saveToken(data.access_token);
        const me = await api.me();
        await AsyncStorage.setItem("userSession", "activo");
        await AsyncStorage.setItem("userData", email);
        setUser(me);
      } else {
        // Modo offline / MOCK local
        await AsyncStorage.setItem("userSession", "activo");
        await AsyncStorage.setItem("userData", email);
        setUser({ id: "local", email });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      if (API_BASE) {
        await api.register(email, password);
        await login(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (API_BASE) {
        await deleteToken();
      }
      await AsyncStorage.removeItem("userSession");
      await AsyncStorage.removeItem("userData");
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
