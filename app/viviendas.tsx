import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ViviendasSegurasScreen() {
  const [casa, setCasa] = useState('');
  const [miembros, setMiembros] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  const [lugar, setLugar] = useState('');
  
  const [nodosVinculados, setNodosVinculados] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const loadNodes = async () => {
        try {
          const raw = await AsyncStorage.getItem('@viviendas_nodes');
          if (raw && active) {
            setNodosVinculados(JSON.parse(raw));
          }
        } catch (error) {
          console.log('Error al cargar nodos:', error);
        }
      };
      loadNodes();
      return () => {
        active = false;
      };
    }, [])
  );

  const generarCredencialCasa = () => {
    if (!casa || !miembros || !habitaciones || !lugar) {
      Alert.alert('⚠️ Campos Incompletos', 'Ingresa todos los datos requeridos (casa, miembros, habitaciones y lugar) antes de generar.');
      return;
    }
    
    const newId = `nodo_${Math.random().toString(36).substring(2, 8)}`;
    
    // Alerta obligatoria de creación de perfil de la casa
    Alert.alert(
      "🔑 Registro Pendiente: Perfil Obligatorio",
      `Para registrar y activar el nodo '${casa}', es obligatorio configurar el perfil del portador primero.`,
      [
        {
          text: "Configurar Perfil",
          onPress: () => {
            router.push({
              pathname: '/edit-profile',
              params: { 
                mandatory: 'true', 
                origin: 'viviendas',
                casa,
                miembros,
                habitaciones,
                lugar
              }
            });
            // Resetear entradas
            setCasa('');
            setMiembros('');
            setHabitaciones('');
            setLugar('');
          }
        }
      ],
      { cancelable: false }
    );
  };

  const eliminarNodo = (id: string) => {
    Alert.alert(
      "🗑️ Eliminar Nodo",
      "¿Estás seguro de que deseas eliminar este nodo domótico y su perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              const raw = await AsyncStorage.getItem('@viviendas_nodes');
              if (raw) {
                const list = JSON.parse(raw);
                const filtered = list.filter((n: any) => n.id !== id);
                await AsyncStorage.setItem('@viviendas_nodes', JSON.stringify(filtered));
                setNodosVinculados(filtered);
                await AsyncStorage.removeItem(`@profile_${id}`);
              }
            } catch (err) {
              console.log("Error al eliminar nodo:", err);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIVIENDAS SEGURAS</Text>
        <Text style={styles.subtitle}>Panel Domótico y Generación de API</Text>
      </View>

      {/* SECCIÓN DE VINCULACIÓN */}
      <Text style={styles.sectionTitle}>VINCULAR NUEVO NODO DOMÓTICO</Text>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nombre de la Casa / Nodo *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Casa Central" 
          placeholderTextColor="#555"
          value={casa}
          onChangeText={setCasa}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Cantidad de Miembros *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 4 personas" 
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={miembros}
          onChangeText={setMiembros}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Cantidad de Habitaciones *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 3 habitaciones" 
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={habitaciones}
          onChangeText={setHabitaciones}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Lugar de Colocación (Habitación/Área) *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Cocina" 
          placeholderTextColor="#555"
          value={lugar}
          onChangeText={setLugar}
        />
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={generarCredencialCasa}>
        <Text style={styles.buttonText}>GENERAR CREDENCIAL</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bleButton} 
        onPress={() => router.push("/WifiConfigScreen" as any)}
      >
        <Ionicons name="bluetooth" size={16} color="#FF4500" style={{ marginRight: 8 }} />
        <Text style={styles.bleButtonText}>CONFIGURAR WIFI POR BLUETOOTH (BLE)</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* NODOS VINCULADOS */}
      <Text style={styles.sectionTitle}>NODOS ACTIVOS ({nodosVinculados.length})</Text>
      {nodosVinculados.length > 0 ? (
        nodosVinculados.map((nodo: any) => (
          <View key={nodo.id} style={styles.cardLinked}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>🟢 {nodo.name}</Text>
              <Text style={styles.cardStatusText}>ACTIVO</Text>
            </View>
            <Text style={styles.cardData}>NODE ID: {nodo.id}</Text>
            <Text style={styles.cardData}>API KEY: {nodo.key}</Text>
            <Text style={styles.cardData}>MIEMBROS: {nodo.miembros}</Text>
            <Text style={styles.cardData}>HABITACIONES: {nodo.habitaciones}</Text>
            <Text style={styles.cardData}>SOS NÚMERO: {nodo.emergencia || 'No registrado'}</Text>
            
            <View style={styles.cardAlertInside}>
              <Text style={styles.readingLabel}>Calidad de Aire ({nodo.lugar}):</Text>
              <Text style={styles.readingValueInside}>Aire limpio en esa zona</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.profileBtn}
                onPress={() => router.push(`/edit-profile?deviceId=${nodo.id}&origin=viviendas`)}
              >
                <Text style={styles.profileBtnText}>EDITAR PERFIL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => eliminarNodo(nodo.id)}
              >
                <Text style={styles.deleteBtnText}>ELIMINAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.cardDesc}>No tienes nodos de vivienda vinculados aún.</Text>
      )}

      {/* PANEL DE MONITOREO SIMULADO */}
      <View style={{marginTop: 30}}>
        <Text style={styles.sectionTitle}>MONITOREO DE AIRE GENERAL (MQ-2)</Text>
        <View style={styles.cardAlert}>
          <Text style={styles.readingLabel}>Nivel de Gas/Humo detectado:</Text>
          <Text style={styles.readingValue}>LIMPIO</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>REGRESAR AL SELECTOR</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', padding: 20 },
  header: { marginTop: 40, marginBottom: 30 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#888888', fontSize: 16 },
  sectionTitle: { color: '#AAAAAA', fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  formGroup: { marginBottom: 15 },
  inputLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333333', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  actionButton: { backgroundColor: '#FF4500', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  backButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 40 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLinked: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#FF4500', borderRadius: 12, padding: 20, marginBottom: 20 },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  cardStatusText: { color: '#00FF00', fontSize: 12, fontWeight: 'bold' },
  cardData: { color: '#AAAAAA', fontSize: 14, marginBottom: 5, fontFamily: 'monospace' },
  cardDesc: { color: '#888888', fontSize: 14, fontStyle: 'italic', marginBottom: 20 },
  cardAlert: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 20, alignItems: 'center' },
  cardAlertInside: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 15, marginVertical: 10, alignItems: 'center' },
  readingLabel: { color: '#AAAAAA', fontSize: 14 },
  readingValue: { color: '#00FF00', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  readingValueInside: { color: '#00FF00', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 },
  profileBtn: { 
    flex: 1,
    borderWidth: 1, 
    borderColor: '#FF4500', 
    borderRadius: 8, 
    paddingVertical: 10, 
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.05)'
  },
  profileBtnText: { color: '#FF4500', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CC0000',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(204, 0, 0, 0.05)'
  },
  deleteBtnText: { color: '#CC0000', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  bleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF4500',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  bleButtonText: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  }
});
