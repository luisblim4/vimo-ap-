import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ViviendasSegurasScreen() {
  const insets = useSafeAreaInsets();
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
    
    const newId = `nodo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
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
            } as any);
          }
        }
      ]
    );
  };

  const eliminarNodo = async (id: string) => {
    Alert.alert(
      "⚠️ Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar este nodo domótico?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const actualizados = nodosVinculados.filter(n => n.id !== id);
            setNodosVinculados(actualizados);
            await AsyncStorage.setItem('@viviendas_nodes', JSON.stringify(actualizados));
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 10 }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>VIVIENDAS SEGURAS</Text>
        <Text style={styles.subtitle}>Panel Domótico y Generación de Nodos</Text>
      </View>

      {/* FORMULARIO DE REGISTRO */}
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
        onPress={() => router.push("/pair-device" as any)}
      >
        <Ionicons name="bluetooth" size={16} color="#00E5FF" style={{ marginRight: 8 }} />
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
            
            <View style={styles.cardAlertInside}>
              <Text style={styles.readingLabel}>Calidad de Aire ({nodo.lugar}):</Text>
              <Text style={styles.readingValueInside}>Aire limpio en esa zona</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.profileBtn}
                onPress={() => router.push(`/edit-profile?deviceId=${nodo.id}&origin=viviendas` as any)}
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

      {/* BOTÓN INSTITUCIONES Y MUSEOS */}
      <View style={{ marginTop: 25 }}>
        <Text style={styles.sectionTitle}>SECTOR INSTITUCIONAL Y MONUMENTOS</Text>
        
        <TouchableOpacity 
          style={styles.institucionesButton} 
          onPress={() => router.push("/instituciones" as any)}
        >
          <Ionicons name="business" size={22} color="#00FF00" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.institucionesButtonTitle}>INSTITUCIONES Y MUSEOS</Text>
            <Text style={styles.institucionesButtonSub}>Gestión de Museos, Parques y Patrimonio Histórico</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#00FF00" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>REGRESAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 25 },
  title: { color: '#00E5FF', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#888888', fontSize: 14, marginTop: 4 },
  sectionTitle: { color: '#AAAAAA', fontSize: 11, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 20 },
  formGroup: { marginBottom: 15 },
  inputLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#101B3B', borderWidth: 1, borderColor: '#1E293B', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, fontSize: 15 },
  actionButton: { backgroundColor: '#00E5FF', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  backButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#0A1128', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLinked: { backgroundColor: '#101B3B', borderWidth: 1, borderColor: '#00E5FF', borderRadius: 12, padding: 18, marginBottom: 15 },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  cardStatusText: { color: '#00FF00', fontSize: 12, fontWeight: 'bold' },
  cardData: { color: '#AAAAAA', fontSize: 13, marginBottom: 4, fontFamily: 'monospace' },
  cardDesc: { color: '#888888', fontSize: 14, fontStyle: 'italic', marginBottom: 20 },
  cardAlertInside: { backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#1E293B', borderRadius: 8, padding: 12, marginVertical: 10, alignItems: 'center' },
  readingLabel: { color: '#AAAAAA', fontSize: 13 },
  readingValueInside: { color: '#00FF00', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  profileBtn: { 
    flex: 1,
    borderWidth: 1, 
    borderColor: '#00E5FF', 
    borderRadius: 8, 
    paddingVertical: 10, 
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.05)'
  },
  profileBtnText: { color: '#00E5FF', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
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
    borderColor: '#00E5FF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  bleButtonText: {
    color: '#00E5FF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  institucionesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.08)',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  institucionesButtonTitle: {
    color: '#00FF00',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  institucionesButtonSub: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  }
});
