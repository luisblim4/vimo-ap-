import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EspecificacionesViviendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 10 }]} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
    >
      <Text style={styles.title}>Especificaciones de Casa</Text>
      <Text style={styles.subtitle}>Ubicación & Contactos de Emergencia</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={24} color="#00FF00" />
          <Text style={styles.cardTitle}>Ubicación del Nodo Domótico</Text>
        </View>
        <Text style={styles.cardData}>COORDINADAS: 32.5150° N, 117.0390° W</Text>
        <Text style={styles.cardData}>ZONA: Tijuana, Baja California</Text>
        <Text style={styles.cardDesc}>Nodo configurado en área principal (Cocina / Sala Central).</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call" size={24} color="#00E5FF" />
          <Text style={styles.cardTitle}>Red de Contactos SOS</Text>
        </View>
        <Text style={styles.cardData}>CONTACTO 1: Central de Emergencias 911</Text>
        <Text style={styles.cardData}>CONTACTO 2: Operador Administrador registrado</Text>
        <Text style={styles.cardDesc}>Notificaciones en tiempo real habilitadas ante disparos del sensor.</Text>
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
  cardData: { color: '#00FF00', fontWeight: 'bold', fontSize: 12, marginBottom: 4, fontFamily: 'monospace' },
  cardDesc: { color: '#94A3B8', fontSize: 12, lineHeight: 17, marginTop: 4 },
  backBtn: { marginTop: 30, padding: 15, alignItems: 'center' },
  backBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold' }
});
