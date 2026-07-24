import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface SensorData {
  id: string;
  gas_mq2: number;
  humidity_dht: number;
  timestamp: string;
}

export default function HistorialScreen() {
  const { user, isLoading } = useContext(AuthContext);
  const [telemetry, setTelemetry] = useState<SensorData[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // 1️⃣ Protección de Ruta (Gatekeeper)
  if (!isLoading && !user) {
    return <Redirect href="/login" />;
  }

  // 2️⃣ Carga de Datos en Tiempo Real
  useEffect(() => {
    if (!user) return;

    // Escuchamos la colección protegida que alimenta el backend en Python
    const q = query(
      collection(db, 'guardian_data'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SensorData[];
      
      setTelemetry(data);
      setIsFetching(false);
    }, (error) => {
      console.log("Error escuchando guardian_data:", error);
      setIsFetching(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Pantalla de carga mientras resuelve el AuthContext o Firestore
  if (isLoading || isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>Sincronizando con Guardián...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>🏛️ Panel del Curador</Text>
      <Text style={styles.subtitle}>Supervisión Ambiental en Tiempo Real</Text>

      {/* Tarjeta de Estado Crítico */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Última Lectura (Guardián)</Text>
        {telemetry.length > 0 ? (
          <>
            <Text style={styles.dataText}>💨 Gas/Humo: {telemetry[0].gas_mq2} ppm</Text>
            <Text style={styles.dataText}>💧 Humedad: {telemetry[0].humidity_dht}%</Text>
            <Text style={styles.timeText}>Actualizado: {telemetry[0].timestamp}</Text>
          </>
        ) : (
          <Text style={styles.dataText}>Sin datos registrados en guardian_data.</Text>
        )}
      </View>

      {/* Espacio reservado para las gráficas */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartPlaceholder}>[ Aquí irá la gráfica de react-native-chart-kit ]</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#00ff00',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    color: '#00ff00',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 10,
    fontStyle: 'italic',
  },
  chartContainer: {
    height: 220,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  chartPlaceholder: {
    color: '#555555',
  }
});
