import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../../app/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLE_DEV_MOCK = process.env.EXPO_PUBLIC_DEV_MOCK === 'true';

export interface MockUser {
  email: string;
  uid: string;
  isMock: true;
}

export type AuthUser = User | MockUser | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  isLoading: boolean;
  login?: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      console.log('Error al cerrar sesión:', e);
    } finally {
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, isLoading, logout }}>
      {ENABLE_DEV_MOCK && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>⚠️ MODO MOCK ACTIVO - PRUEBAS LOCALES</Text>
        </View>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
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
