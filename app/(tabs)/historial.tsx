import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HistorialScreen() {
  const insets = useSafeAreaInsets();
  
  // 🟢 Inicializamos el historial totalmente VACÍO. Cero alertas de prueba.
  const [historial, setHistorial] = useState<string[]>([]);

  // 🔴 Función para borrar todo el historial con confirmación de seguridad
  const confirmarBorrado = () => {
    Alert.alert(
      "⚠️ Limpiar Historial",
      "¿Estás seguro de que deseas eliminar todos los registros del sistema? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, borrar todo", 
          style: "destructive",
          onPress: () => setHistorial([]) // Vaciamos la lista
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}>
      {/* Cabecera con el botón de borrar */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial VIMO</Text>
        
        {/* El botón de borrar solo aparece si hay algo en el historial */}
        {historial.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={confirmarBorrado}>
            <Ionicons name="trash-outline" size={14} color="#FF4444" style={{ marginRight: 4 }} />
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Si el historial está vacío, mostramos un mensaje limpio y profesional */}
      {historial.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#00FF00" style={{ marginBottom: 15 }} />
          <Text style={styles.emptyTitle}>Historial Limpio</Text>
          <Text style={styles.emptySub}>
            No hay incidentes ni alertas registradas. El sistema está operando con total normalidad.
          </Text>
        </View>
      ) : (
        /* Si hubiera alertas reales, se mostrarían aquí */
        <FlatList
          data={historial}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.alertaCard}>
              <Text style={styles.alertaText}>{item}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 20 },
  title: { fontSize: 24, color: '#00E5FF', fontWeight: 'bold', letterSpacing: 1 },
  
  clearBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FF4444' },
  clearBtnText: { color: '#FF4444', fontWeight: 'bold', fontSize: 12 },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

  alertaCard: { backgroundColor: '#101B3B', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  alertaText: { color: '#FFFFFF', fontSize: 14 }
});
