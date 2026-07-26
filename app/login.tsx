import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function LoginGeneralScreen() {
  const router = useRouter();
  const { login } = useAuth(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.replace('/selector'); 
    } catch (err: any) {
      console.log("Login error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VIMO S3 - ACCESO AL SISTEMA</Text>
      <Text style={styles.subtitle}>Plataforma de Control & Monitoreo</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput 
        style={styles.input} 
        placeholder="Correo electrónico" 
        placeholderTextColor="#666" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />

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

      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>INICIAR SESIÓN</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 20 }}>
        <Text style={styles.linkText}>¿No tienes cuenta? Crea una aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, color: '#00ff00', fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 25 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
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
  errorText: { color: '#ff4444', textAlign: 'center', marginBottom: 15 },
  linkText: { color: '#00ff00', textAlign: 'center', fontSize: 14 }
});
