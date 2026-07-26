import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ViviendasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 10 }]} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
    >
      <Text style={styles.headerTitle}>Viviendas Seguras</Text>
      <Text style={styles.headerSubtitle}>Panel de Control Domótico & Protección</Text>

      {/* BOTÓN 1: MONITOREO DE VIVIENDA */}
      <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/monitoreo-vivienda')}>
        <Ionicons name="shield-checkmark" size={32} color="#00E5FF" style={{ marginRight: 15 }} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Monitoreo de Vivienda</Text>
          <Text style={styles.cardSub}>Sensores de gas, intrusión y estado de El Guardián en tiempo real</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#00E5FF" />
      </TouchableOpacity>

      {/* BOTÓN 2: ESPECIFICACIONES */}
      <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/especificaciones-vivienda')}>
        <Ionicons name="location" size={32} color="#00FF00" style={{ marginRight: 15 }} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Especificaciones de Casa</Text>
          <Text style={styles.cardSub}>Ubicación, códigos de emergencia SOS y red de contactos</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#00FF00" />
      </TouchableOpacity>

      {/* BOTÓN 3: PERFIL (CON ACCESO A MUSEOS) */}
      <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/perfil-vivienda')}>
        <Ionicons name="person-circle" size={32} color="#FFD700" style={{ marginRight: 15 }} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Perfil y Credenciales</Text>
          <Text style={styles.cardSub}>Gestión de nodos, administrador y VIMO Museos e Instituciones</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFD700" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/selector')}>
        <Text style={styles.backBtnText}>Volver al Centro de Mando</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, color: '#00E5FF', fontWeight: 'bold', marginTop: 20, textAlign: 'center', letterSpacing: 1 },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 35, marginTop: 4 },
  menuCard: { 
    flexDirection: 'row', 
    backgroundColor: '#101B3B', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#1E293B',
    alignItems: 'center'
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#94A3B8', lineHeight: 16 },
  backBtn: { marginTop: 30, padding: 15, alignItems: 'center' },
  backBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold' }
});
