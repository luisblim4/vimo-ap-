import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type WiFiNetwork = {
  ssid: string;
  strength: string;
};

export default function PairDeviceScreen() {
  const [phase, setPhase] = useState<'scan' | 'connect' | 'credentials' | 'provisioning' | 'success'>('scan');
  
  // Lista de redes 2.4 GHz escaneadas y simuladas del ESP32
  const simulatedNetworks: WiFiNetwork[] = [
    { ssid: 'Vimo_Local_Net_2.4G', strength: '🟢 Excelente' },
    { ssid: 'Infinitum_2.4G_Normal', strength: '🟢 Fuerte' },
    { ssid: 'Totalplay_Home_2.4', strength: '🟡 Media' },
    { ssid: '[Ingresar Red Manualmente]', strength: '' }
  ];

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [manualSsid, setManualSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [scanProgress, setScanProgress] = useState(false);
  const [devicesFound, setDevicesFound] = useState<any[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para iniciar el escaneo de Bluetooth
  const iniciarEscaneo = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    setScanProgress(true);
    setDevicesFound([]);
    scanTimeoutRef.current = setTimeout(() => {
      setDevicesFound([
        { id: 'esp32_vimos3', name: '🟢 VIMO S3 (ESP32)', status: 'Listo para emparejar', compatible: true },
        { id: 'tv_sala', name: '🔴 Smart TV Sala', status: 'Incompatible', compatible: false },
        { id: 'buds_ble', name: '🔴 Audífonos Buds', status: 'Incompatible', compatible: false },
      ]);
      setScanProgress(false);
      scanTimeoutRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    if (phase === 'scan') {
      iniciarEscaneo();
    }
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [phase, iniciarEscaneo]);

  // Conexión BLE simulada
  const conectarDispositivo = () => {
    setPhase('connect');
    setTimeout(() => {
      setPhase('credentials');
      setSelectedNetwork(null);
      setWifiPassword('');
      setManualSsid('');
    }, 2000);
  };

  // Enviar credenciales
  const enviarCredenciales = () => {
    const finalSsid = selectedNetwork === '[Ingresar Red Manualmente]' ? manualSsid.trim() : selectedNetwork;
    if (!finalSsid) {
      Alert.alert('Error', 'Por favor ingresa o selecciona un nombre de red WiFi.');
      return;
    }
    if (!wifiPassword) {
      Alert.alert('Error', 'Por favor ingresa la contraseña de tu red WiFi.');
      return;
    }

    setPhase('provisioning');
    setConsoleLogs([]);

    const addLog = (text: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setConsoleLogs((prev) => [...prev, text]);
          resolve();
        }, delay);
      });
    };

    const runLogs = async () => {
      const is5G = finalSsid.toUpperCase().includes('5G') || finalSsid.toUpperCase().includes('5GHZ');
      
      await addLog('[1/5] [BLE] Enlazando canal seguro con VIMO S3... OK', 600);
      await addLog(`[2/5] [BLE] Enviando credenciales de red: SSID: "${finalSsid}"... OK`, 800);
      await addLog('[3/5] [ESP32] Recibido paquete. Escribiendo credenciales en memoria interna NVS... OK', 800);
      await addLog('[4/5] [ESP32] Apagando Bluetooth para ahorro de energía... OK', 800);
      await addLog(`[5/5] [ESP32] Probando conexión autónoma a red WiFi "${finalSsid}"...`, 800);

      if (is5G) {
        // Simulación de Timeout de 30 segundos
        await addLog('      [ESP32] Buscando señal... (Intentando conectar a banda 5 GHz)', 1000);
        await addLog('      [ESP32] ERROR: Señal no encontrada (Incompatibilidad física de antena 5 GHz).', 1200);
        await addLog('⚠️ [ESP32] LÍMITE DE INTENTOS ALCANZADO (Timeout 30s de búsqueda). Conexión Abortada.', 1200);
        await addLog('[ESP32] Reactivando antena Bluetooth por seguridad... OK', 800);
        await addLog('[BLE] Canal de emparejamiento reiniciado. Listo para recibir credenciales 2.4 GHz.', 600);

        setTimeout(() => {
          Alert.alert(
            '⚠️ Fallo de Conexión (Timeout)',
            'El ESP32 no pudo conectarse a la red (Frecuencia 5 GHz no compatible). El Bluetooth ha sido reiniciado. Por favor, ingresa una red compatible de 2.4 GHz.',
            [
              {
                text: 'Reintentar',
                onPress: () => {
                  setPhase('credentials');
                  setSelectedNetwork(null);
                  setWifiPassword('');
                }
              }
            ]
          );
        }, 1000);
      } else {
        // Éxito con red 2.4 GHz
        await addLog('      [ESP32] Enlace de radioestablecimiento WiFi... OK', 800);
        await addLog('      [ESP32] Conexión WiFi Establecida.', 600);
        await addLog('      [ESP32] IP Local Asignada: 192.168.1.145', 500);
        await addLog('[BLE] Desconectado de forma segura. Proceso completado con éxito.', 800);

        setTimeout(() => {
          setPhase('success');
        }, 1500);
      }
    };

    runLogs();
  };

  return (
    <View style={styles.container}>
      {/* Botón superior de retroceso */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FF4500" />
          <Text style={styles.backBtnText}>REGRESAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="bluetooth" size={42} color="#FF4500" />
          <Text style={styles.title}>EMPAREJAR HARDWARE</Text>
          <Text style={styles.subtitle}>Configuración de WiFi por Bluetooth (BLE)</Text>
        </View>

        {phase === 'scan' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>DISPOSITIVOS CERCANOS</Text>
            {scanProgress ? (
              <View style={styles.scanState}>
                <ActivityIndicator size="large" color="#FF4500" />
                <Text style={styles.scanText}>Buscando señales del VIMO S3...</Text>
              </View>
            ) : (
              <View style={styles.deviceList}>
                {devicesFound.map((d) => (
                  <TouchableOpacity 
                    key={d.id} 
                    style={[styles.deviceRow, !d.compatible && styles.deviceDisabled]}
                    disabled={!d.compatible}
                    onPress={conectarDispositivo}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deviceName}>{d.name}</Text>
                      <Text style={styles.deviceStatus}>{d.status}</Text>
                    </View>
                    {d.compatible && (
                      <Ionicons name="chevron-forward" size={18} color="#FF4500" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity 
              style={[styles.secondaryBtn, scanProgress && styles.btnDisabled]} 
              onPress={iniciarEscaneo}
              disabled={scanProgress}
            >
              <Text style={styles.secondaryBtnText}>
                {scanProgress ? 'BUSCANDO DISPOSITIVOS...' : 'BUSCAR DE NUEVO'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'connect' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>VINCULANDO DISPOSITIVO</Text>
            <View style={styles.scanState}>
              <ActivityIndicator size="large" color="#FF4500" />
              <Text style={styles.scanText}>Estableciendo canal Bluetooth seguro...</Text>
              <Text style={styles.subText}>Cifrando credenciales de paso BLE...</Text>
            </View>
          </View>
        )}

        {phase === 'credentials' && (
          <View style={styles.card}>
            {/* Aviso preventivo UX */}
            <View style={styles.noticeBox}>
              <Ionicons name="warning" size={20} color="#FF4500" style={{ marginRight: 10 }} />
              <Text style={styles.noticeText}>
                ⚠️ Nota: VIMO S3 solo es compatible con redes WiFi de 2.4 GHz. Asegúrate de no usar la red 5G de tu módem.
              </Text>
            </View>

            <Text style={styles.cardHeader}>SELECCIONAR RED WIFI (SÓLO 2.4 GHz)</Text>
            <View style={styles.pickerContainer}>
              {simulatedNetworks.map((net) => {
                const active = selectedNetwork === net.ssid;
                return (
                  <TouchableOpacity
                    key={net.ssid}
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedNetwork(net.ssid);
                      setWifiPassword('');
                      setManualSsid('');
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerText, active && styles.pickerTextActive]}>
                        {net.ssid} {net.strength ? `(${net.strength})` : ''}
                      </Text>
                    </View>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={18} color="#FF4500" />
                    ) : (
                      <Ionicons name="wifi-outline" size={18} color="#555" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedNetwork && (
              <View style={styles.wifiFormBox}>
                <Text style={styles.wifiFormTitle}>
                  Configurar conexión a: {selectedNetwork}
                </Text>

                {selectedNetwork === '[Ingresar Red Manualmente]' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Nombre de la Red (SSID) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: MiRedWiFi_2.4G"
                      placeholderTextColor="#555"
                      value={manualSsid}
                      onChangeText={setManualSsid}
                    />
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Contraseña de la Red WiFi *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresar contraseña de WiFi"
                    placeholderTextColor="#555"
                    secureTextEntry
                    value={wifiPassword}
                    onChangeText={setWifiPassword}
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={enviarCredenciales}>
                  <Text style={styles.primaryBtnText}>
                    CONECTAR DISPOSITIVO
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setPhase('scan')}>
              <Text style={styles.secondaryBtnText}>DESCONECTAR BLUETOOTH</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'provisioning' && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>APROVISIONAMIENTO DE HARDWARE (CONSOLA LOGS)</Text>
            <View style={styles.consoleConsole}>
              {consoleLogs.map((log, index) => (
                <Text key={index} style={styles.consoleText}>{log}</Text>
              ))}
            </View>
            <ActivityIndicator size="small" color="#FF4500" style={{ marginTop: 15 }} />
          </View>
        )}

        {phase === 'success' && (
          <View style={styles.card}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-done-circle" size={80} color="#00FF00" />
            </View>
            <Text style={styles.successTitle}>✅ CONFIGURACIÓN COMPLETA</Text>
            <Text style={styles.successDesc}>
              Las credenciales de WiFi fueron guardadas exitosamente en la memoria interna NVS del ESP32.
              El módulo Bluetooth ha sido apagado de forma automática y el dispositivo se conectará a la red de forma autónoma a partir de ahora.
            </Text>
            
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/selector')}>
              <Text style={styles.primaryBtnText}>IR AL SELECTOR</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', padding: 20 },
  topHeader: { marginTop: 30, marginBottom: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { color: '#FF4500', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 1, marginTop: 10 },
  subtitle: { color: '#888888', fontSize: 13, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333333', marginTop: 10 },
  cardHeader: { color: '#FF4500', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  scanState: { alignItems: 'center', marginVertical: 30 },
  scanText: { color: '#FFFFFF', fontSize: 15, marginTop: 15, fontWeight: 'bold' },
  subText: { color: '#888888', fontSize: 12, marginTop: 4 },
  deviceList: { marginBottom: 20 },
  deviceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 8, 
    padding: 15, 
    marginBottom: 10 
  },
  deviceDisabled: { opacity: 0.4 },
  deviceName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  deviceStatus: { color: '#888888', fontSize: 12, marginTop: 2 },
  primaryBtn: { backgroundColor: '#FF4500', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  secondaryBtn: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#555555', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  secondaryBtnText: { color: '#AAAAAA', fontWeight: 'bold', fontSize: 14 },
  btnDisabled: { opacity: 0.4 },
  noticeBox: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255, 69, 0, 0.1)', 
    borderWidth: 1, 
    borderColor: '#FF4500', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 20,
    alignItems: 'center'
  },
  noticeText: { color: '#FFFFFF', fontSize: 12, flex: 1, fontWeight: 'bold', lineHeight: 16 },
  formGroup: { marginBottom: 15 },
  inputLabel: { color: '#AAAAAA', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#333333', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  pickerContainer: { marginBottom: 20 },
  pickerItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 8, 
    padding: 15, 
    marginBottom: 8 
  },
  pickerItemActive: { borderColor: '#FF4500', backgroundColor: 'rgba(255, 69, 0, 0.03)' },
  pickerText: { color: '#AAAAAA', fontSize: 14 },
  pickerTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  consoleConsole: { backgroundColor: '#050B14', borderRadius: 8, padding: 15, minHeight: 200, borderWidth: 1, borderColor: '#0A2540' },
  consoleText: { color: '#00FF00', fontSize: 12, marginBottom: 5, fontFamily: 'monospace' },
  successIcon: { alignItems: 'center', marginVertical: 20 },
  successTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  successDesc: { color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  wifiFormBox: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15
  },
  wifiFormTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 8
  },
  activeLabel: {
    color: '#FF4500',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textTransform: 'uppercase'
  }
});
