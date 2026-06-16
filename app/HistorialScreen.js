// @ts-nocheck
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HistorialScreen() {
  // Datos simulados (Mocks) de alta calidad para la demostración en el InterCECyTE
  const [eventos, setEventos] = useState([
    { 
      id: '1', 
      tipo: 'CRÍTICO', 
      mensaje: 'Fuga de gas detectada por sensor MQ-2', 
      hora: '18:42', 
      fecha: '15 Jun 2026',
      color: '#FF5722' 
    },
    { 
      id: '2', 
      tipo: 'ALERTA', 
      mensaje: 'Vimo Portátil: Modo de rastreo GPS activado', 
      hora: '15:10', 
      fecha: '15 Jun 2026',
      color: '#FFC107' 
    },
    { 
      id: '3', 
      tipo: 'SISTEMA', 
      mensaje: 'Conexión exitosa a red WiFi Totalplay-2.4G', 
      hora: '09:15', 
      fecha: '15 Jun 2026',
      color: '#4CAF50' 
    },
    { 
      id: '4', 
      tipo: 'SISTEMA', 
      mensaje: 'Operador autenticado en el Centro de Comando', 
      hora: '08:30', 
      fecha: '15 Jun 2026',
      color: '#4CAF50' 
    },
    { 
      id: '5', 
      tipo: 'CRÍTICO', 
      mensaje: 'Pico de gas leve detectado en cocina', 
      hora: '23:14', 
      fecha: '14 Jun 2026',
      color: '#FF5722' 
    }
  ]);

  // Diseño de cada tarjeta de la bitácora
  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.badge, { borderColor: item.color, color: item.color }]}>
          {item.tipo}
        </Text>
        <Text style={styles.timeText}>{item.fecha} - {item.hora}</Text>
      </View>
      <Text style={styles.messageText}>{item.mensaje}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />
      
      {/* Botón superior de retroceso */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FF5722" />
          <Text style={styles.backBtnText}>REGRESAR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>BITÁCORA DE OPERACIONES</Text>
        <Text style={styles.subtitle}>Historial Analítico en Tiempo Real</Text>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay eventos registrados en el sistema.</Text>
        }
      />

      {/* Botón para simular limpieza de logs o actualización manual */}
      <TouchableOpacity style={styles.refreshButton} onPress={() => alert('Sincronizando con base de datos en la nube...')}>
        <Text style={styles.refreshButtonText}>ACTUALIZAR HISTORIAL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E17' },
  topHeader: { marginTop: 40, marginBottom: 10, paddingHorizontal: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { color: '#FF5722', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  header: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#161B22' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
  subtitle: { fontSize: 12, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  scrollContent: { padding: 20 },
  logCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#222', borderRadius: 8, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { fontSize: 10, fontWeight: 'bold', borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, letterSpacing: 1 },
  timeText: { color: '#555', fontSize: 11, fontWeight: 'bold' },
  messageText: { color: '#CCC', fontSize: 14, lineHeight: 20 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 14 },
  refreshButton: { backgroundColor: '#1E1410', borderWidth: 1, borderColor: '#FF5722', borderRadius: 8, paddingVertical: 14, margin: 20, alignItems: 'center' },
  refreshButtonText: { color: '#FF5722', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 }
});
