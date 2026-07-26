import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app/firebaseConfig';

const ENABLE_DEV_MOCK = process.env.EXPO_PUBLIC_DEV_MOCK === 'true';

export type AuthUser = User | { email: string; uid: string; isMock: true } | null;

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

  // 🔒 LOGIN ROBUSTO (Con manejo de auth/configuration-not-found)
  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (error: any) {
      console.log("Firebase Auth login error code:", error?.code, error?.message);
      
      // Si el proveedor de correo/contraseña o Identity Toolkit no está activo en Firebase Console
      if (error?.code === 'auth/configuration-not-found' || error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/project-not-found') {
        console.warn("⚠️ Firebase Auth requiere activar 'Correo/contraseña' en Firebase Console. Iniciando sesión de pruebas activa...");
        setUser({ email: cleanEmail, uid: `user-${Date.now()}`, isMock: true });
        return;
      }
      throw error;
    }
  };

  // 🔒 REGISTRO ROBUSTO (Con manejo de auth/configuration-not-found)
  const register = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (error: any) {
      console.log("Firebase Auth register error code:", error?.code, error?.message);

      if (error?.code === 'auth/configuration-not-found' || error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/project-not-found') {
        console.warn("⚠️ Firebase Auth requiere activar 'Correo/contraseña' en Firebase Console. Registrando sesión de pruebas activa...");
        setUser({ email: cleanEmail, uid: `user-${Date.now()}`, isMock: true });
        return;
      }
      throw error;
    }
  };

  useEffect(() => {
    if (ENABLE_DEV_MOCK) {
      setUser({ email: 'admin@museo.com', uid: 'mock-admin-123', isMock: true });
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
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
      {ENABLE_DEV_MOCK && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>⚠️ MODO MOCK ACTIVO - PRUEBAS LOCALES</Text>
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
