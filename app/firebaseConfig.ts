import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBsL4cSeWJPP24FKuukznQV8wdxKu2ISEA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "vimo-s3.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "vimo-s3",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "vimo-s3.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "66991987954",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:66991987954:web:d55bf63054703e8ae5c46b",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔥 LA MAGIA: Persistencia nativa para evitar que las credenciales se evaporen
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
