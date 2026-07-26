import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor llena todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.replace('/HistorialScreen'); 
    } catch (err: any) {
      setError('Credenciales inválidas o sin permisos de administrador.');
      Alert.alert('Error', 'Acceso denegado al sistema Guardián.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vimo S3 - Acceso Restringido</Text>
      <Text style={styles.subtitle}>Panel de Curador / Administrador</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput 
        style={styles.input} 
        placeholder="Correo Institucional" 
        placeholderTextColor="#666" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        autoCapitalize="none" 
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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Ingresar al Sistema</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, color: '#00ff00', fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 30 },
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
});
