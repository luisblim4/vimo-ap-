import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../app/firebaseConfig';

// ==================================================
// ⚡ SWITCH DE DESARROLLO (MOCK SEGURO VÍA ENV)
// ==================================================
const ENABLE_DEV_MOCK = process.env.EXPO_PUBLIC_DEV_MOCK === 'true';

export interface MockUser {
  email: string;
  uid: string;
  isMock: true;
}

export type AuthUser = User | MockUser | null;

interface AuthContextType {
  user: AuthUser;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Flujo de Desarrollo (Sin bloqueos para el equipo)
    if (ENABLE_DEV_MOCK) {
      console.log("⚠️ MOCK MODE ACTIVO: Simulando sesión de Administrador");
      setUser({ email: 'admin@museo.com', uid: 'mock-admin-123', isMock: true });
      setIsLoading(false);
      return;
    }

    // 2️⃣ Flujo de Producción (Suscripción real a Firebase)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false); // Apagamos el spinner exactamente cuando Firebase responde
    });

    // Limpiamos la suscripción de memoria al desmontar
    return () => unsubscribe();
  }, []);

  // ==================================================
  // 🛑 ESTADO DE CARGA GLOBAL (Cero destellos visuales)
  // ==================================================
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {/* ⚠️ BANNER DE SEGURIDAD PARA DEMO: Imposible no notarlo si se dejó el mock activo */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center', // Centrado vertical perfecto
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  mockBanner: {
    backgroundColor: '#D32F2F',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  mockBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
