import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../app/firebaseConfig';

const ENABLE_DEV_MOCK = process.env.EXPO_PUBLIC_DEV_MOCK === 'true';

export interface MockUser {
  email: string;
  uid: string;
  isMock: true;
  isOffline?: boolean;
}

export type AuthUser = User | MockUser | null;

interface AuthContextType {
  user: AuthUser;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isLoading: true,
  login: async () => {},    
  register: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==================================================
  // 🔐 LOGIN GARANTIZADO
  // ==================================================
  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (error: any) {
      console.log("Fallo en login Firebase:", error?.message || error);
      // Fallback Offline: Revisa si hay red caída o timeout
      const isNetworkErr = error?.message?.includes('network') || error?.message?.includes('fetch') || error?.code === 'auth/network-request-failed';
      if (isNetworkErr) {
        console.log("Habilitando sesión Offline de emergencia...");
        const offlineUser = { email: cleanEmail, uid: `offline-${Date.now()}`, isMock: true, isOffline: true };
        await AsyncStorage.setItem('@vimo_offline_session', JSON.stringify(offlineUser));
        setUser(offlineUser as any);
      } else {
        throw error; // Lanza el error real (contraseña incorrecta, etc) a la UI
      }
    }
  };

  // ==================================================
  // 📝 REGISTRO GARANTIZADO (Auto-Login & Offline)
  // ==================================================
  const register = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (error: any) {
      console.log("Fallo en registro Firebase:", error?.message || error);
      
      // Auto-Login si el correo ya está en uso
      if (error?.code === 'auth/email-already-in-use') {
        console.log("El correo ya existe. Forzando Auto-Login...");
        await login(cleanEmail, pass); 
      } 
      // Fallback Offline si falla la red
      else if (error?.message?.includes('network') || error?.message?.includes('fetch') || error?.code === 'auth/network-request-failed') {
        console.log("Habilitando sesión Offline de emergencia en Registro...");
        const offlineUser = { email: cleanEmail, uid: `offline-${Date.now()}`, isMock: true, isOffline: true };
        await AsyncStorage.setItem('@vimo_offline_session', JSON.stringify(offlineUser));
        setUser(offlineUser as any);
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    if (ENABLE_DEV_MOCK) {
      setUser({ email: 'admin@museo.com', uid: 'mock-admin-123', isMock: true });
      setIsLoading(false);
      return;
    }

    const checkOfflineSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('@vimo_offline_session');
        if (stored) {
          setUser(JSON.parse(stored));
          setIsLoading(false);
          return true; // Hay sesión offline
        }
      } catch (e) {
        console.log("Error leyendo sesión offline", e);
      }
      return false;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoading(false);
      } else {
        // Si Firebase dice que no hay sesión, comprobamos el fallback offline
        const hasOffline = await checkOfflineSession();
        if (!hasOffline) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register }}>
      {(ENABLE_DEV_MOCK || (user as any)?.isOffline) && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>
            {(user as any)?.isOffline ? "⚠️ MODO OFFLINE ACTIVO - RED CAÍDA" : "⚠️ MODO MOCK ACTIVO - PRUEBAS LOCALES"}
          </Text>
        </View>
      )}
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  mockBanner: { backgroundColor: '#D32F2F', paddingVertical: 4, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  mockBannerText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
});
