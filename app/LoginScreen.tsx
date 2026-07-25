import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useAuth } from '@/src/context/AuthContext';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const authContext = useAuth();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo institucional y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (authContext?.login && typeof authContext.login === 'function') {
        await authContext.login(email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.replace('/HistorialScreen' as any);
    } catch (err: any) {
      console.log("Error login screen:", err);
      let msg = 'Credenciales inválidas o sin permisos de administrador.';
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Contraseña incorrecta. Por favor verifica tus datos.';
      } else if (err?.code === 'auth/user-not-found') {
        msg = 'No existe una cuenta registrada con este correo.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'El formato de correo es inválido.';
      }
      setError(msg);
      Alert.alert('Acceso Denegado', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vimo S3 - Acceso Restringido</Text>
      <Text style={styles.subtitle}>Panel de Curador / Administrador</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo Institucional"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
        </Pressable>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Ingresar al Sistema</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>REGRESAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, color: '#00ff00', fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 15,
  },
  eyeBtn: {
    padding: 15,
  },
  button: { backgroundColor: '#00ff00', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  backButton: { borderWidth: 1, borderColor: '#555', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  backButtonText: { color: '#aaa', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  errorText: { color: '#ff4444', textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
});

export default LoginScreen;
