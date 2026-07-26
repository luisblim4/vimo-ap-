import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app/firebaseConfig';

const ENABLE_DEV_MOCK = process.env.EXPO_PUBLIC_DEV_MOCK === 'true';

// Eliminamos "MockUser" de la producción, solo usamos el User real de Firebase
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

  // 🔒 LOGIN ESTRICTO
  const login = async (email: string, pass: string) => {
    // Aquí signInWithEmailAndPassword hace la validación criptográfica real
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  };

  // 🔒 REGISTRO ESTRICTO (Sin Auto-Login)
  const register = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  };

  useEffect(() => {
    if (ENABLE_DEV_MOCK) {
      setUser({ email: 'admin@museo.com', uid: 'mock-admin-123', isMock: true });
      setIsLoading(false);
      return;
    }

    // Firebase maneja la persistencia real gracias a getReactNativePersistence en firebaseConfig.ts
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
