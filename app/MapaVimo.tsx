import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Asegúrate de que la ruta sea correcta

export default function MapaVimo() {
  const [alertas, setAlertas] = useState<any[]>([]);

  useEffect(() => {
    // 📡 RADAR ENCENDIDO: Escuchando la colección exacta donde escribe el ESP32
    const unsubscribe = onSnapshot(collection(db, "obstaculos"), (snapshot) => {
      const nuevasAlertas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() // Extrae latitud, longitud, nodo_id, etc.
      }));
      
      console.log("🚨 [VIMO API] Dato recibido del hardware:", nuevasAlertas);
      setAlertas(nuevasAlertas);
    }, (error) => {
      console.error("Error leyendo Firebase: ", error);
    });

    // Apaga el radar si el usuario sale de la pantalla para ahorrar batería
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Rastreador Vimo S3 (Real-time)</Text>
      <Text style={styles.contador}>Total de alertas activas en Firestore: {alertas.length}</Text>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        {alertas.length === 0 ? (
          <Text style={styles.sinAlertas}>No hay alertas activas en Firestore en este momento.</Text>
        ) : (
          alertas.map((alerta) => (
            <View key={alerta.id} style={styles.tarjeta}>
              <View style={styles.tarjetaHeader}>
                <Text style={styles.tarjetaTitulo}>🔴 Alerta: {alerta.tipo || 'Desconocido'}</Text>
                <Text style={styles.tarjetaNodo}>{alerta.nodo_id || 'Sin Nodo'}</Text>
              </View>
              <Text style={styles.tarjetaTexto}>📍 Ubicación: {alerta.latitud}, {alerta.longitud}</Text>
              {alerta.descripcion && (
                <Text style={styles.tarjetaDesc}>📝 Descripción: {alerta.descripcion}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0C0D0F' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#FFFFFF', textAlign: 'center' },
  contador: { fontSize: 14, color: '#8E9AA8', marginBottom: 20, textAlign: 'center' },
  scroll: { gap: 12 },
  sinAlertas: { color: '#8E9AA8', textAlign: 'center', marginTop: 40, fontSize: 14 },
  tarjeta: { padding: 16, backgroundColor: '#1A1C20', borderRadius: 12, borderWidth: 1, borderColor: '#2E333A' },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tarjetaTitulo: { fontSize: 16, fontWeight: 'bold', color: '#F87171' },
  tarjetaNodo: { fontSize: 12, color: '#60A5FA', fontWeight: '500' },
  tarjetaTexto: { fontSize: 13, color: '#E2E8F0', marginBottom: 4 },
  tarjetaDesc: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 }
});
