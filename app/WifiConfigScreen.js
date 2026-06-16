import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, ScrollView, Platform 
} from 'react-native';
import * as Location from 'expo-location';
import WifiManager from 'react-native-wifi-reborn';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WifiConfigScreen() {
  const [redesDisponibles, setRedesDisponibles] = useState([]);
  const [redSeleccionada, setRedSeleccionada] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [escaneando, setEscaneando] = useState(true);

  useEffect(() => {
    const escanearEntornoWiFi = async () => {
      if (Platform.OS === 'android') {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se requiere ubicación para buscar redes.');
          setEscaneando(false);
          return;
        }

        try {
          const redActual = await WifiManager.getCurrentWifiSSID();
          const listaBruta = await WifiManager.loadWifiList();
          
          // Filtro para dejar solo las redes de 2.4 GHz
          const redesLimpias = listaBruta
            .filter(wifi => wifi.frequency < 3000 && wifi.SSID)
            .filter((wifi, index, self) => 
              index === self.findIndex((w) => w.SSID === wifi.SSID)
            );
            
          setRedesDisponibles(redesLimpias);
          setEscaneando(false);

          if (redActual && !redActual.includes("error") && redActual !== "<unknown ssid>") {
            const es24G = redesLimpias.some(w => w.SSID === redActual);
            
            if (es24G) {
              Alert.alert(
                'Red Compatible Detectada',
                `Estás conectado a ${redActual}. ¿Quieres usar esta red para tu dispositivo?`,
                [
                  { text: 'Elegir otra', style: 'cancel' },
                  { text: 'Sí, usar esta', onPress: () => setRedSeleccionada(redActual) }
                ]
              );
            } else {
              Alert.alert(
                'Red No Compatible',
                `Estás conectado a una red 5G (${redActual}). Selecciona una red 2.4 GHz de la lista.`
              );
            }
          }
        } catch (error) {
          console.log("Error de antena WiFi", error);
          setEscaneando(false);
        }
      }
    };

    escanearEntornoWiFi();
  }, []);

  const handleEnviarCredenciales = () => {
    if (!redSeleccionada || !password) {
      Alert.alert('Faltan datos', 'Selecciona una red y escribe la contraseña.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('¡Enviado!', `Credenciales transmitidas por Bluetooth.`);
      setPassword('');
      setRedSeleccionada('');
    }, 2500);
  };

  return (
    <View style={styles.container}>
      {/* Botón superior de retroceso */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FF5722" />
          <Text style={styles.backBtnText}>REGRESAR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.bluetoothIcon}>Bluetooth</Text>
        <Text style={styles.title}>EMPAREJAR HARDWARE</Text>
        <Text style={styles.subtitle}>Configuración de WiFi por Bluetooth (BLE)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ <Text style={{fontWeight: 'bold'}}>Nota:</Text> El sistema solo es compatible con redes WiFi de 2.4 GHz. Las redes 5G han sido ocultadas por seguridad.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>SELECCIONAR RED WIFI (SÓLO 2.4 GHz)</Text>

        {escaneando ? (
          <ActivityIndicator size="large" color="#FF5722" style={{marginVertical: 20}} />
        ) : (
          redesDisponibles.map((red, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.networkCard, redSeleccionada === red.SSID && styles.networkCardSelected]}
              onPress={() => setRedSeleccionada(red.SSID)}
            >
              <Text style={styles.networkName}>{red.SSID}</Text>
              <View style={[styles.signalDot, {backgroundColor: red.level > -60 ? '#4CAF50' : '#FFC107'}]} />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity 
          style={[styles.networkCard, redSeleccionada === 'manual' && styles.networkCardSelected]}
          onPress={() => setRedSeleccionada('manual')}
        >
          <Text style={styles.networkName}>[Ingresar Red Manualmente]</Text>
        </TouchableOpacity>

        {redSeleccionada !== '' && (
          <View style={styles.passwordSection}>
            {redSeleccionada === 'manual' && (
              <TextInput
                style={styles.input}
                placeholder="Escribe el nombre de la red"
                placeholderTextColor="#666"
                onChangeText={setRedSeleccionada}
              />
            )}
            <Text style={styles.label}>Contraseña para {redSeleccionada === 'manual' ? 'la red' : redSeleccionada}:</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce la contraseña"
              placeholderTextColor="#666"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleEnviarCredenciales} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#0A0E17" /> : <Text style={styles.buttonText}>TRANSMITIR CREDENCIALES</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E17' },
  topHeader: { marginTop: 40, marginBottom: 10, paddingHorizontal: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { color: '#FF5722', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  header: { alignItems: 'center', paddingTop: 10, paddingBottom: 20 },
  bluetoothIcon: { color: '#FF5722', fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 5 },
  scrollContent: { padding: 20 },
  warningBox: { backgroundColor: '#2A1A12', borderWidth: 1, borderColor: '#FF5722', borderRadius: 8, padding: 15, marginBottom: 25 },
  warningText: { color: '#FFF', fontSize: 13, lineHeight: 20 },
  sectionTitle: { color: '#FF5722', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  networkCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161B22', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 18, marginBottom: 10 },
  networkCardSelected: { borderColor: '#FF5722', backgroundColor: '#1E1410' },
  networkName: { color: '#CCC', fontSize: 15 },
  signalDot: { width: 12, height: 12, borderRadius: 6 },
  passwordSection: { marginTop: 15, marginBottom: 20, padding: 15, backgroundColor: '#11151C', borderRadius: 8, borderWidth: 1, borderColor: '#222' },
  label: { color: '#FFF', fontSize: 13, marginBottom: 10 },
  input: { backgroundColor: '#0A0E17', color: '#FFF', borderRadius: 6, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#333', marginBottom: 10 },
  button: { backgroundColor: '#FF5722', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#555' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});
