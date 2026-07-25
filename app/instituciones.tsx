import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type InstitutionType = 'museo' | 'parque' | 'historico' | null;

export default function InstitucionesScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<InstitutionType>(null);

  const handleSelectCategory = (type: InstitutionType, name: string) => {
    setSelectedType(type);
    Alert.alert(
      `🏛️ Categoría Seleccionada: ${name}`,
      `Se ha filtrado el monitoreo domótico para el tipo de institución '${name}'.`,
      [{ text: "Entendido" }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>INSTITUCIONES & MUSEOS</Text>
        <Text style={styles.subtitle}>Gestión de Patrimonio, Curaduría y Parques</Text>
      </View>

      {/* SELECCIÓN DE CATEGORÍA INSTITUCIONAL */}
      <Text style={styles.sectionTitle}>SELECCIONA TIPO DE INSTITUCIÓN</Text>
      
      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.categoryCard, selectedType === 'museo' && styles.categoryCardSelected]}
          onPress={() => handleSelectCategory('museo', 'Museo / Galería')}
        >
          <Ionicons name="business" size={32} color={selectedType === 'museo' ? '#00FF00' : '#00E5FF'} />
          <Text style={styles.categoryTitle}>Museo / Galería</Text>
          <Text style={styles.categoryDesc}>Monitoreo de humedad, humo y salas de exhibición.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryCard, selectedType === 'parque' && styles.categoryCardSelected]}
          onPress={() => handleSelectCategory('parque', 'Parque / Reserva')}
        >
          <Ionicons name="leaf" size={32} color={selectedType === 'parque' ? '#00FF00' : '#00FF00'} />
          <Text style={styles.categoryTitle}>Parque / Reserva</Text>
          <Text style={styles.categoryDesc}>Sensores ambientales al aire libre e incidentes.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryCard, selectedType === 'historico' && styles.categoryCardSelected]}
          onPress={() => handleSelectCategory('historico', 'Lugar Histórico')}
        >
          <Ionicons name="color-palette" size={32} color={selectedType === 'historico' ? '#00FF00' : '#FFD700'} />
          <Text style={styles.categoryTitle}>Lugar Histórico</Text>
          <Text style={styles.categoryDesc}>Protección preventiva de inmuebles del patrimonio.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* RUTAS Y HERRAMIENTAS DE GESTIÓN */}
      <Text style={styles.sectionTitle}>HERRAMIENTAS DEL CURADOR Y EQUIPO</Text>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => router.push('/HistorialScreen' as any)}
      >
        <Ionicons name="analytics" size={20} color="#00FF00" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionBtnTitle}>PANEL DEL CURADOR (HISTORIAL)</Text>
          <Text style={styles.actionBtnSub}>Monitoreo de gas, humedad y telemetría en vivo</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => router.push('/EquipoScreen' as any)}
      >
        <Ionicons name="people" size={20} color="#00E5FF" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionBtnTitle}>EQUIPO VIMO S3</Text>
          <Text style={styles.actionBtnSub}>Ver integrantes y roles de desarrollo</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => router.push('/LoginScreen' as any)}
      >
        <Ionicons name="lock-closed" size={20} color="#FFD700" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionBtnTitle}>ACCESO RESTRINGIDO (LOGIN)</Text>
          <Text style={styles.actionBtnSub}>Iniciar sesión de administrador / curador</Text>
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
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#888888', fontSize: 14, marginTop: 4 },
  sectionTitle: { color: '#AAAAAA', fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  grid: { gap: 12 },
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
  categoryTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  categoryDesc: { color: '#888888', fontSize: 13, marginTop: 4 },
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
