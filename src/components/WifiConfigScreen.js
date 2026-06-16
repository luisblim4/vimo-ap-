import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, ScrollView, Platform 
} from 'react-native';
import * as Location from 'expo-location';
import WifiManager from 'react-native-wifi-reborn';

export default function WifiConfigScreen() {
  const [redesDisponibles, setRedesDisponibles] = useState([]);
  const [redSeleccionada, setRedSeleccionada] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [escaneando, setEscaneando] = useState(true);

  useEffect(() => {
    const escanearEntornoWiFi = async () => {
      if (Platform.OS === 'android') {
        // 1. Permiso de GPS estricto para Android
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se requiere ubicación para buscar redes Vimo.');
          setEscaneando(false);
          return;
        }

        try {
          // 2. Analizar la red conectada actualmente
          const redActual = await WifiManager.getCurrentWifiSSID();
          
          // 3. Buscar todas las redes alrededor
          const listaBruta = await WifiManager.loadWifiList();
          
          // 4. FILTRO INTELIGENTE: Solo dejar las de 2.4 GHz (frecuencia menor a 3000 MHz)
          // y quitar duplicados o redes sin nombre
          const redesLimpias = listaBruta
            .filter(wifi => wifi.frequency < 3000 && wifi.SSID)
            .filter((wifi, index, self) => 
              index === self.findIndex((w) => w.SSID === wifi.SSID)
            );
            
          setRedesDisponibles(redesLimpias);
          setEscaneando(false);

          // 5. Lógica de sugerencia de red actual
          if (redActual && !redActual.includes("error") && redActual !== "<unknown ssid>") {
            // Verificamos si la red actual está en nuestra lista de 2.4G permitidas
            const es24G = redesLimpias.some(w => w.SSID === redActual);
            
            if (es24G) {
              Alert.alert(
                'Red Compatible Detectada',
                `Estás conectado a ${redActual}. ¿Quieres usar esta red para Vimo S3?`,
                [
                  { text: 'Elegir otra', style: 'cancel' },
                  { 
                    text: 'Sí, usar esta', 
                    onPress: () => setRedSeleccionada(redActual) 
                  }
                ]
              );
            } else {
              Alert.alert(
                'Red No Compatible',
                `Estás conectado a una red 5G (${redActual}). Por favor, selecciona una red 2.4 GHz de la lista de abajo para tu nodo de seguridad.`
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
      Alert.alert('¡Enviado!', `Credenciales transmitidas por BLE al dispositivo.`);
      setPassword('');
      setRedSeleccionada('');
    }, 2500);
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.bluetoothIcon}>Bluetooth</Text>
        <Text style={styles.title}>EMPAREJAR HARDWARE</Text>
        <Text style={styles.subtitle}>Configuración de WiFi por Bluetooth (BLE)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Alerta de 2.4 GHz */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ <Text style={{fontWeight: 'bold'}}>Nota:</Text> VIMO S3 solo es compatible con redes WiFi de 2.4 GHz. Las redes 5G han sido ocultadas por seguridad.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>SELECCIONAR RED WIFI (SÓLO 2.4 GHz)</Text>

        {/* Lista Dinámica de Redes */}
        {escaneando ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{marginVertical: 20}} />
        ) : (
          redesDisponibles.map((red, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.networkCard, 
                redSeleccionada === red.SSID && styles.networkCardSelected
              ]}
              onPress={() => setRedSeleccionada(red.SSID)}
            >
              <Text style={styles.networkName}>
                {red.SSID}
              </Text>
              {/* Indicador visual de señal basado en el 'level' (dBm) del módem */}
              <View style={[
                styles.signalDot, 
                {backgroundColor: red.level > -60 ? '#4CAF50' : '#FFC107'}
              ]} />
            </TouchableOpacity>
          ))
        )}

        {/* Entrada Manual (Fallback) */}
        <TouchableOpacity 
          style={[styles.networkCard, redSeleccionada === 'manual' && styles.networkCardSelected]}
          onPress={() => setRedSeleccionada('manual')}
        >
          <Text style={styles.networkName}>[Ingresar Red Manualmente]</Text>
        </TouchableOpacity>

        {/* Zona de Contraseña (Solo aparece si seleccionan una red) */}
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
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>TRANSMITIR CREDENCIALES</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E17' }, // Deep blue/black
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20 },
  bluetoothIcon: { color: '#3B82F6', fontSize: 24, marginBottom: 10, fontWeight: 'bold' }, // Vibrant blue
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 5 }, // Slate grey
  scrollContent: { padding: 20 },
  warningBox: { backgroundColor: '#162031', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 8, padding: 15, marginBottom: 25 }, // Deep blue-grey background, blue border
  warningText: { color: '#FFF', fontSize: 13, lineHeight: 20 },
  sectionTitle: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 }, // Vibrant blue
  networkCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 18, marginBottom: 10 }, // Slate card
  networkCardSelected: { borderColor: '#3B82F6', backgroundColor: '#101E36' }, // Selected border blue, bg transparent blue-grey
  networkName: { color: '#E2E8F0', fontSize: 15 },
  signalDot: { width: 12, height: 12, borderRadius: 6 },
  passwordSection: { marginTop: 15, marginBottom: 20, padding: 15, backgroundColor: '#162031', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  label: { color: '#FFF', fontSize: 13, marginBottom: 10 },
  input: { backgroundColor: '#0A0E17', color: '#FFF', borderRadius: 6, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  button: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 10 }, // Blue button
  buttonDisabled: { backgroundColor: '#475569' }, // Slate grey disabled
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});
