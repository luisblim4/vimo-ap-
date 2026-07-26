import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MonitoreoViviendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 10 }]} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
    >
      <Text style={styles.title}>Monitoreo de Vivienda</Text>
      <Text style={styles.subtitle}>Telemetría Domótica en Tiempo Real</Text>

      {/* TARJETA 1: CALIDAD DE AIRE & GAS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="flame" size={24} color="#00FF00" />
          <Text style={styles.cardTitle}>Calidad de Aire & Sensor de Gas</Text>
        </View>
        <Text style={styles.sensorStatus}>ESTADO: NORMAL (0 ppm)</Text>
        <Text style={styles.cardDesc}>Sin concentraciones anómalas de gas LP ni humo en la cocina.</Text>
      </View>

      {/* TARJETA 2: INTRUSIÓN Y SEGURIDAD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#00E5FF" />
          <Text style={styles.cardTitle}>Sistema de Intrusión El Guardián</Text>
        </View>
        <Text style={styles.sensorStatusCyan}>ESTADO: ARMADO & ACTIVO</Text>
        <Text style={styles.cardDesc}>Puertas y ventanas monitoreadas. Sensores infrarrojos calibrados.</Text>
      </View>

      {/* TARJETA 3: ACTUACIÓN Y VENTANAS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="hardware-chip" size={24} color="#FFD700" />
          <Text style={styles.cardTitle}>Automatización Domótica</Text>
        </View>
        <Text style={styles.sensorStatusGold}>VENTANAS: CERRADAS</Text>
        <Text style={styles.cardDesc}>Servo-mecanismo listo para apertura automática ante fuga de gas.</Text>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Volver a Viviendas Seguras</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', paddingHorizontal: 20 },
  title: { fontSize: 24, color: '#00E5FF', fontWeight: 'bold', marginTop: 20, textAlign: 'center', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 25, marginTop: 4 },
  card: { backgroundColor: '#101B3B', padding: 18, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  sensorStatus: { color: '#00FF00', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  sensorStatusCyan: { color: '#00E5FF', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  sensorStatusGold: { color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  cardDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17 },
  backBtn: { marginTop: 30, padding: 15, alignItems: 'center' },
  backBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold' }
});
