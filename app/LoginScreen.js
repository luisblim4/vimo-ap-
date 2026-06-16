// @ts-nocheck
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert('Faltan datos', 'Ingresa el correo de operador y la contraseña de acceso.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, correo, password);
      Alert.alert('¡Acceso Autorizado!', 'Bienvenido al Centro de Comando de VIMO S3.');
    } catch (error) {
      Alert.alert('Acceso Denegado', 'Las credenciales no coinciden o el operador no existe.');
    }
    setLoading(false);
  };

  const handleRegistro = async () => {
    if (!correo || !password) {
      Alert.alert('Faltan datos', 'Por favor rellena ambos campos para el alta.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Seguridad débil', 'La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, correo, password);
      Alert.alert('Registro Exitoso', 'El operador ha sido guardado de forma segura en la nube.');
      setCorreo('');
      setPassword('');
    } catch (error) {
      Alert.alert('Error de Registro', 'Asegúrate de usar un formato de correo válido.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>VIMO S3</Text>
        <Text style={styles.subtitle}>Centro de Comando InterCECyTE</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>OPERADOR AUTORIZADO (CORREO):</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@equipo.com"
            placeholderTextColor="#555"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <Text style={styles.label}>CLAVE ENCRIPTADA DE ACCESO:</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduce la contraseña"
            placeholderTextColor="#555"
            secureTextEntry={true}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#FF5722" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.registerButton} onPress={handleRegistro}>
                <Text style={styles.registerButtonText}>DAR DE ALTA NUEVO OPERADOR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E17' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF5722', textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 40, letterSpacing: 1, textTransform: 'uppercase' },
  formContainer: { backgroundColor: '#11151C', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#222' },
  label: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: '#0A0E17', color: '#FFF', borderRadius: 8, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  actionSection: { marginTop: 10 },
  loginButton: { backgroundColor: '#FF5722', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  loginButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  registerButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF5722', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  registerButtonText: { color: '#FF5722', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 }
});
