import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function PerfilViviendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 10 }]} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
    >
      <Text style={styles.title}>Perfil del Administrador</Text>
      <Text style={styles.subtitle}>Gestión de Nodos Domóticos y Sector Institucional</Text>
      
      {/* INFORMACIÓN DEL USUARIO */}
      <View style={styles.credencialBox}>
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={24} color="#00E5FF" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.userEmail}>{user?.email || 'operador@vimo.io'}</Text>
            <Text style={styles.credencialText}>Credenciales activas: 1 Nodo Registrado</Text>
          </View>
        </View>
      </View>

      {/* EL BOTÓN DESGLOSADO DE MUSEOS E INSTITUCIONES */}
      <Text style={styles.sectionHeader}>SECTOR INSTITUCIONAL Y PATRIMONIAL</Text>
      
      <TouchableOpacity style={styles.museoBtn} onPress={() => router.push('/instituciones')}>
        <View style={styles.museoHeader}>
          <Ionicons name="business" size={28} color="#00FF00" style={{ marginRight: 10 }} />
          <Text style={styles.museoTitle}>VIMO MUSEO E INSTITUCIONES</Text>
        </View>
        <Text style={styles.museoDesc}>
          Activar protocolo estricto para preservación de obras de arte, reservas naturales o patrimonio histórico.
        </Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>Museos & Galerías</Text>
          <Text style={styles.badge}>Parques Naturales</Text>
          <Text style={styles.badge}>Monumentos</Text>
        </View>
      </TouchableOpacity>

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
  credencialBox: { backgroundColor: '#101B3B', padding: 18, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  row: { flexDirection: 'row', alignItems: 'center' },
  userEmail: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  credencialText: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  sectionHeader: { color: '#AAAAAA', fontSize: 11, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
  museoBtn: { 
    backgroundColor: 'rgba(0, 255, 0, 0.06)', 
    borderColor: '#00FF00', 
    borderWidth: 1, 
    padding: 20, 
    borderRadius: 12 
  },
  museoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  museoTitle: { color: '#00FF00', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  museoDesc: { color: '#AAAAAA', fontSize: 13, lineHeight: 18 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  badge: { backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#00FF00', color: '#00FF00', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold' },
  backBtn: { marginTop: 35, padding: 15, alignItems: 'center' },
  backBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold' }
});
