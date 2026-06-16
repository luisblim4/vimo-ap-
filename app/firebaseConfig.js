// @ts-nocheck
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importamos el sistema de sesiones
import { getFirestore } from "firebase/firestore"; // Importamos Firestore

// Tus claves exactas de Vimo S3
const firebaseConfig = {
  apiKey: "AIzaSyBsL4cSeWJPP24FKuukznQV8wdxKu2ISEA",
  authDomain: "vimo-s3.firebaseapp.com",
  projectId: "vimo-s3",
  storageBucket: "vimo-s3.firebasestorage.app",
  messagingSenderId: "66991987954",
  appId: "1:66991987954:web:d55bf63054703e8ae5c46b",
  measurementId: "G-R9TVQ9Q7XZ"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos el guardia para usarlo en la pantalla de Login
export const auth = getAuth(app);

// Exportamos la base de datos Firestore
export const db = getFirestore(app);
