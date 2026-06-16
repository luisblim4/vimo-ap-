import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/src/api/client';

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{ 
    deviceId?: string; 
    mandatory?: string; 
    origin?: string;
    casa?: string;
    miembros?: string;
    habitaciones?: string;
    lugar?: string;
    deviceName?: string;
  }>();

  const { deviceId, mandatory, origin } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignedDeviceId, setAssignedDeviceId] = useState(deviceId || '');

  // --- Campos para el perfil de Vimo Portátil (Personal) ---
  // Obligatorios (4 campos)
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  // Opcionales (6 campos)
  const [direccion, setDireccion] = useState('');
  const [medicacion, setMedicacion] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [alergias, setAlergias] = useState('');
  const [genero, setGenero] = useState('');
  const [diagnosticos, setDiagnosticos] = useState('');

  // --- Campos para el perfil de Viviendas Seguras (Casa) ---
  // Obligatorios (5 campos)
  const [casa, setCasa] = useState('');
  const [miembros, setMiembros] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  const [lugar, setLugar] = useState('');
  const [emergencia, setEmergencia] = useState('');

  useEffect(() => {
    if (!deviceId && origin === 'viviendas' && !assignedDeviceId) {
      setAssignedDeviceId(`nodo_${Math.random().toString(36).substring(2, 8)}`);
    }
  }, [deviceId, origin, assignedDeviceId]);

  const targetDeviceId = deviceId || assignedDeviceId;
  const storageKey = targetDeviceId ? `@profile_${targetDeviceId}` : '@profile_general';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (targetDeviceId) {
          const saved = await AsyncStorage.getItem(`@profile_${targetDeviceId}`);
          if (saved) {
            const data = JSON.parse(saved);
            if (origin === 'viviendas') {
              setCasa(data.casa || '');
              setMiembros(data.miembros || '');
              setHabitaciones(data.habitaciones || '');
              setLugar(data.lugar || '');
              setEmergencia(data.emergencia || '');
            } else {
              setNombre(data.nombre || '');
              setEdad(data.edad || '');
              setContactoNombre(data.contactoNombre || '');
              setContactoTelefono(data.contactoTelefono || '');
              setDireccion(data.direccion || '');
              setMedicacion(data.medicacion || '');
              setTipoSangre(data.tipoSangre || '');
              setAlergias(data.alergias || '');
              setGenero(data.genero || '');
              setDiagnosticos(data.diagnosticos || '');
            }
          } else {
            // Si no hay perfil previo, precargar con los datos recibidos de viviendas
            if (origin === 'viviendas') {
              setCasa(params.casa || '');
              setMiembros(params.miembros || '');
              setHabitaciones(params.habitaciones || '');
              setLugar(params.lugar || '');
            }
          }
        }
      } catch (error) {
        console.log('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [targetDeviceId, origin, params]);

  const guardarDatos = async () => {
    if (origin === 'viviendas') {
      // Validación de Viviendas Seguras
      if (!casa || !miembros || !habitaciones || !lugar || !emergencia) {
        Alert.alert("⚠️ Campos Incompletos", "Por favor llena todos los campos marcados con * antes de guardar.");
        return;
      }

      setSaving(true);
      const activeNodeId = targetDeviceId || `nodo_${Math.random().toString(36).substring(2, 8)}`;
      const profileData = { origin, casa, miembros, habitaciones, lugar, emergencia };

      try {
        // 1. Guardar el perfil del nodo
        await AsyncStorage.setItem(`@profile_${activeNodeId}`, JSON.stringify(profileData));

        // 2. Persistir/actualizar en la lista global de nodos activos de viviendas
        const savedNodesRaw = await AsyncStorage.getItem('@viviendas_nodes');
        const nodesList = savedNodesRaw ? JSON.parse(savedNodesRaw) : [];
        
        const existingIndex = nodesList.findIndex((n: any) => n.id === activeNodeId);
        const nodeInfo = {
          id: activeNodeId,
          name: casa,
          key: `viv_key_${Math.random().toString(36).substring(2, 12)}`,
          miembros,
          habitaciones,
          lugar,
          emergencia
        };

        if (existingIndex > -1) {
          nodesList[existingIndex] = { ...nodesList[existingIndex], ...nodeInfo };
        } else {
          nodesList.push(nodeInfo);
        }

        await AsyncStorage.setItem('@viviendas_nodes', JSON.stringify(nodesList));

        Alert.alert("✅ Éxito", "Perfil de la vivienda registrado y nodo activado.");
        router.back();
      } catch (error) {
        Alert.alert("❌ Error", "No se pudieron guardar los datos.");
      } finally {
        setSaving(false);
      }
    } else {
      // Validación de Vimo Portátil (Personal)
      if (!nombre || !edad || !contactoNombre || !contactoTelefono) {
        Alert.alert("⚠️ Campos Incompletos", "Por favor llena todos los campos obligatorios marcados con * antes de guardar.");
        return;
      }

      const profileData = {
        nombre,
        edad,
        contactoNombre,
        contactoTelefono,
        direccion,
        medicacion,
        tipoSangre,
        alergias,
        genero,
        diagnosticos,
      };

      setSaving(true);
      try {
        let activeDeviceId = deviceId;

        // Si no tenemos deviceId en los params, significa que estamos registrando uno NUEVO.
        // Llamamos al backend para crearlo únicamente en este momento.
        if (!activeDeviceId) {
          const dev = await api.createDevice(params.deviceName || "VIMO S3");
          activeDeviceId = dev.id;
        }

        // Guardamos el perfil en memoria enlazado al ID del dispositivo
        await AsyncStorage.setItem(`@profile_${activeDeviceId}`, JSON.stringify(profileData));
        Alert.alert("✅ Éxito", "Perfil del portador actualizado y encriptado.");
        router.back();
      } catch (error: any) {
        Alert.alert("❌ Error de Activación", error?.message || "No se pudo registrar el dispositivo.");
      } finally {
        setSaving(false);
      }
    }
  };

  const cancelarVinculacion = () => {
    Alert.alert(
      "⚠️ Cancelar Vinculación",
      "Se cancelará la vinculación y no se guardará el registro. ¿Estás seguro?",
      [
        { text: "No, continuar", style: "cancel" },
        { text: "Sí, cancelar", onPress: () => router.back() }
      ]
    );
  };

  if (loading || saving) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4500" />
        {saving && (
          <Text style={{ color: '#AAAAAA', marginTop: 15, fontSize: 16, fontWeight: 'bold' }}>
            Guardando y vinculando dispositivo...
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>EDITAR PERFIL</Text>
        <Text style={styles.subtitle}>
          {origin === 'viviendas' 
            ? 'Configuración Domótica y Seguridad de Vivienda' 
            : 'Ficha Médica y Operativa del Portador'}
        </Text>
      </View>

      {origin === 'viviendas' ? (
        // --- Formulario para Viviendas Seguras ---
        <View>
          <Text style={styles.sectionTitle}>DATOS OBLIGATORIOS DE LA CASA</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>1. Nombre de la Casa *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={casa} onChangeText={setCasa} placeholder="Ej: Casa Central / Casa de Playa" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>2. Cantidad de Miembros *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" keyboardType="numeric" value={miembros} onChangeText={setMiembros} placeholder="Ej: 4 personas" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>3. Cantidad de Habitaciones *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" keyboardType="numeric" value={habitaciones} onChangeText={setHabitaciones} placeholder="Ej: 3 habitaciones" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>4. Lugar de Colocación (Habitación/Área) *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={lugar} onChangeText={setLugar} placeholder="Ej: Cocina / Sala / Pasillo" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>5. Números de Emergencia de la Vivienda *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" keyboardType="phone-pad" value={emergencia} onChangeText={setEmergencia} placeholder="Ej: 911 / Número de Bomberos" />
          </View>
        </View>
      ) : (
        // --- Formulario para Vimo Portátil (Personal) ---
        <View>
          <Text style={styles.sectionTitle}>DATOS OBLIGATORIOS</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>1. Nombre Completo *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={nombre} onChangeText={setNombre} placeholder="Ej: Luis Fisman" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>2. Edad *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" keyboardType="numeric" value={edad} onChangeText={setEdad} placeholder="Ej: 17" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>3. Nombre de Contacto SOS *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={contactoNombre} onChangeText={setContactoNombre} placeholder="Ej: Mamá / Papá" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>4. Teléfono de Contacto SOS / Número de Emergencia *</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" keyboardType="phone-pad" value={contactoTelefono} onChangeText={setContactoTelefono} placeholder="Ej: 664 123 4567" />
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>DATOS OPCIONALES</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>5. Dirección de tu Casa / Dirección Principal (Opcional)</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={direccion} onChangeText={setDireccion} placeholder="Ej: Calle 123, Tijuana" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>6. Medicación Actual (Opcional - Altamente Editable)</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={medicacion} onChangeText={setMedicacion} placeholder="Ej: Paracetamol (Pon 'Ninguna' si no tomas)" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>7. Tipo de Sangre (Opcional)</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={tipoSangre} onChangeText={setTipoSangre} placeholder="Ej: O+" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>8. Alergias Conocidas (Opcional)</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={alergias} onChangeText={setAlergias} placeholder="Ej: Penicilina" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>9. Género (Opcional)</Text>
            <TextInput style={styles.input} placeholderTextColor="#555" value={genero} onChangeText={setGenero} placeholder="Prefiero no decirlo" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>10. Problemas/Diagnósticos (Opcional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholderTextColor="#555" multiline={true} numberOfLines={3} value={diagnosticos} onChangeText={setDiagnosticos} placeholder="Ej: Asma, hipertensión, etc. Esta info puede salvar vidas." />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={guardarDatos}>
        <Text style={styles.saveButtonText}>GUARDAR CAMBIOS</Text>
      </TouchableOpacity>

      {mandatory === 'true' ? (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelarVinculacion}>
          <Text style={styles.cancelButtonText}>CANCELAR REGISTRO</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>REGRESAR</Text>
        </TouchableOpacity>
      )}
      
      <View style={{ height: 40 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#888888', fontSize: 14, marginTop: 5 },
  sectionTitle: { color: '#FF4500', fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  formGroup: { marginBottom: 15 },
  label: { color: '#AAAAAA', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333333', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#FF4500', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555555', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#AAAAAA', fontWeight: 'bold', fontSize: 16 }
});
