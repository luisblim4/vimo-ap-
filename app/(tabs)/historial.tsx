import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/src/api/client';

export default function HistorialTabScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents('dev_fkkumbo', 50);
      setEvents(data || []);
    } catch (e) {
      console.log('Error al cargar historial de eventos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>BITÁCORA DE HISTORIAL</Text>
        <Text style={styles.subtitle}>Registro de Eventos y Telemetría VIMO Portátil</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00E5FF" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
          {events.length > 0 ? (
            events.map((evt, i) => (
              <View key={evt.id || i} style={styles.eventCard}>
                <View style={styles.row}>
                  <Ionicons 
                    name={evt.type === 'emergency' ? 'alert-circle' : 'information-circle'} 
                    size={20} 
                    color={evt.type === 'emergency' ? '#EF4444' : '#00E5FF'} 
                  />
                  <Text style={styles.eventType}>{evt.type ? evt.type.toUpperCase() : 'TELEMETRÍA'}</Text>
                  <Text style={styles.eventTime}>
                    {evt.created_at ? new Date(evt.created_at).toLocaleTimeString() : 'En vivo'}
                  </Text>
                </View>
                <Text style={styles.eventText}>{evt.text || 'Registro de evento VIMO S3'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay registros de eventos almacenados aún.</Text>
          )}

          <TouchableOpacity style={styles.refreshBtn} onPress={fetchEvents}>
            <Ionicons name="refresh" size={16} color="#00E5FF" style={{ marginRight: 6 }} />
            <Text style={styles.refreshText}>ACTUALIZAR BITÁCORA</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', paddingHorizontal: 20 },
  header: { marginTop: 15, marginBottom: 20 },
  title: { color: '#00E5FF', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  eventCard: { backgroundColor: '#101B3B', borderWidth: 1, borderColor: '#1E293B', borderRadius: 10, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  eventType: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, flex: 1 },
  eventTime: { color: '#94A3B8', fontSize: 11, fontFamily: 'monospace' },
  eventText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#101B3B', borderWidth: 1, borderColor: '#00E5FF', padding: 12, borderRadius: 8, marginTop: 20 },
  refreshText: { color: '#00E5FF', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});
