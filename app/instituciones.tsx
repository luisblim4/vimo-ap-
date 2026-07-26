import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type InstitutionType = 'museo' | 'parque' | 'historico' | null;

export default function InstitucionesScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<InstitutionType>('museo');

  const handleSelectCategory = (type: InstitutionType, name: string) => {
    setSelectedType(type);
    Alert.alert(
      `🏛️ Perfil Institucional Activo: ${name}`,
      `Se han calibrado las lecturas de telemetría y sensores domóticos para '${name}'.`,
      [{ text: "Entendido" }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>INSTITUCIONES & PATRIMONIO</Text>
        <Text style={styles.subtitle}>Gestión Domótica de Museos, Parques y Monumentos</Text>
      </View>

      {/* SELECCIÓN DE CATEGORÍA INSTITUCIONAL */}
      <Text style={styles.sectionTitle}>SELECCIONA TIPO DE INSTITUCIÓN</Text>
      
      <View style={styles.grid}>
        {/* 🏛️ 1. MUSEO / GALERÍA */}
        <TouchableOpacity 
          style={[styles.categoryCard, selectedType === 'museo' && styles.categoryCardSelected]}
          onPress={() => handleSelectCategory('museo', 'Museo / Galería')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={28} color={selectedType === 'museo' ? '#00FF00' : '#00E5FF'} />
            <Text style={styles.categoryTitle}>Museo / Galería</Text>
          </View>
          <Text style={styles.categoryDesc}>
            Monitoreo preventivo de humedad relativa (30%-55%), temperatura controlada para piezas de arte y detectores de humo/gas en salas de exhibición.
          </Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Humedad Artística</Text>
            <Text style={styles.badge}>Sensor Humo</Text>
            <Text style={styles.badge}>Salas de Exhibición</Text>
          </View>
        </TouchableOpacity>

        {/* 🌲 2. PARQUE / RESERVA */}
        <TouchableOpacity 
          style={[styles.categoryCard, selectedType === 'parque' && styles.categoryCardSelected]}
          onPress={() => handleSelectCategory('parque', 'Parque / Reserva')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="leaf" size={28} color={selectedType === 'parque' ? '#00FF00' : '#00FF00'} />
            <Text style={styles.categoryTitle}>Parque / Reserva</Text>
          </View>
          <Text style={styles.categoryDesc}>
            Sensores ambientales al aire libre, estación meteorológica, monitoreo de calidad del aire en tiempo real e incidentes ambientales.
          </Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Aire Libre</Text>
            <Text style={styles.badge}>Calidad de Aire</Text>
            <Text style={styles.badge}>Meteorología</Text>
          </View>
        </TouchableOpacity>

        {/* 🏰 3. LUGAR HISTÓRICO */}
        <TouchableOpacity 
          style={[styles.categoryCard, selectedType === 'historico' && styles.categoryCardSelected]}
          onPress={() => handleSelectCategory('historico', 'Lugar Histórico')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette" size={28} color={selectedType === 'historico' ? '#00FF00' : '#FFD700'} />
            <Text style={styles.categoryTitle}>Lugar Histórico</Text>
          </View>
          <Text style={styles.categoryDesc}>
            Protección de estructura e inmuebles patrimoniales, sensores de humedad estructural, inclinación/sismos y monitoreo sísmico.
          </Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Estructura Patrimonial</Text>
            <Text style={styles.badge}>Humedad Cimentación</Text>
            <Text style={styles.badge}>Inclinación</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* HERRAMIENTAS DEL CURADOR */}
      <Text style={styles.sectionTitle}>HERRAMIENTAS Y PANEL DEL CURADOR</Text>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => router.push('/HistorialScreen' as any)}
      >
        <Ionicons name="analytics" size={20} color="#00FF00" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionBtnTitle}>PANEL DEL CURADOR (TELEMETRÍA)</Text>
          <Text style={styles.actionBtnSub}>Monitoreo de gas, humedad y datos históricos</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => router.push('/LoginScreen' as any)}
      >
        <Ionicons name="lock-closed" size={20} color="#FFD700" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionBtnTitle}>ACCESO ADMINISTRADOR</Text>
          <Text style={styles.actionBtnSub}>Autenticación de curador y responsable de sala</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>REGRESAR</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', padding: 20 },
  header: { marginTop: 40, marginBottom: 25 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#888888', fontSize: 13, marginTop: 4 },
  sectionTitle: { color: '#AAAAAA', fontSize: 11, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  grid: { gap: 14 },
  categoryCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
  },
  categoryCardSelected: {
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  categoryDesc: { color: '#AAAAAA', fontSize: 13, marginTop: 8, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  badge: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', color: '#00FF00', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#222222', marginVertical: 25 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  actionBtnTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  actionBtnSub: { color: '#888888', fontSize: 12, marginTop: 2 },
  backBtn: {
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
});
