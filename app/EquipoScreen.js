// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, FlatList, AppState } from 'react-native';
// Traemos nuestras herramientas de Firebase
import { auth, db } from './firebaseConfig';
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function EquipoScreen() {
  const [codigoEnlace, setCodigoEnlace] = useState('');
  const [operadores, setOperadores] = useState([]);
  
  // Herramienta para saber si la app está abierta o minimizada
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 1. Función para avisarle a Firebase nuestro estado
    const reportarEstado = async (estadoActual) => {
      if (auth.currentUser) {
        // Creamos o actualizamos nuestro expediente en el archivero
        const miExpediente = doc(db, 'operadores', auth.currentUser.uid);
        await setDoc(miExpediente, {
          correo: auth.currentUser.email,
          estado: estadoActual,
          ultimaConexion: serverTimestamp()
        }, { merge: true }); // Merge evita borrar otros datos que ya tengamos
      }
    };

    // Al entrar a la pantalla, nos reportamos "en línea"
    reportarEstado('en línea');

    // 2. El detector de la aplicación (¿Se fue al fondo o regresó?)
    const monitorApp = AppState.addEventListener('change', (estadoSiguiente) => {
      if (appState.current.match(/inactive|background/) && estadoSiguiente === 'active') {
        reportarEstado('en línea'); // El usuario regresó a la app
      } else if (estadoSiguiente.match(/inactive|background/)) {
        reportarEstado('desconectado'); // El usuario minimizó la app
      }
      appState.current = estadoSiguiente;
    });

    // 3. El Radar en Vivo: Escuchar a los demás compañeros
    const referenciaEquipo = collection(db, 'operadores');
    const apagarRadar = onSnapshot(referenciaEquipo, (snapshot) => {
      const listaEquipo = [];
      snapshot.forEach((documento) => {
        listaEquipo.push({ id: documento.id, ...documento.data() });
      });
      setOperadores(listaEquipo);
    });

    // Limpieza de seguridad al salir de la pantalla
    return () => {
      monitorApp.remove();
      apagarRadar();
      reportarEstado('desconectado');
    };
  }, []);

  const generarCodigo = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'VIMO-';
    for (let i = 0; i < 5; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setCodigoEnlace(codigo);
    Alert.alert('Código Generado', `Tu código de acceso es: ${codigo}\n\nCompártelo con tu equipo.`);
  };

  const renderOperador = ({ item }) => {
    // Definimos el color del foco dependiendo del estado
    const enLinea = item.estado === 'en línea';
    
    return (
      <View style={styles.operadorCard}>
        <View>
          <Text style={styles.operadorNombre}>{item.correo}</Text>
          <View style={styles.estadoContainer}>
            <View style={[styles.foco, { backgroundColor: enLinea ? '#4CAF50' : '#555' }]} />
            <Text style={[styles.operadorEstado, { color: enLinea ? '#4CAF50' : '#888' }]}>
              {enLinea ? 'Monitoreando' : 'Desconectado'}
            </Text>
          </View>
        </View>
        
        {/* Si el correo es el nuestro, le ponemos una etiqueta de "Tú" */}
        {auth.currentUser?.email === item.correo && (
          <Text style={styles.etiquetaYo}>TÚ</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RED COMPARTIDA</Text>
        <Text style={styles.subtitle}>Gestión de Operadores y Accesos</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>INVITAR AL EQUIPO</Text>
        {codigoEnlace !== '' && (
          <View style={styles.codigoBox}>
            <Text style={styles.codigoText}>{codigoEnlace}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.buttonMain} onPress={generarCodigo}>
          <Text style={styles.buttonText}>GENERAR CÓDIGO DE ENLACE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>RADAR DE OPERADORES</Text>
        <FlatList
          data={operadores}
          keyExtractor={(item) => item.id}
          renderItem={renderOperador}
          ListEmptyComponent={<Text style={{color: '#888'}}>Buscando señal de operadores...</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E17' },
  header: { padding: 25, paddingTop: 40, borderBottomWidth: 1, borderColor: '#161B22' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF5722', letterSpacing: 1 },
  subtitle: { fontSize: 12, color: '#888', marginTop: 5, textTransform: 'uppercase' },
  panel: { margin: 20, padding: 20, backgroundColor: '#11151C', borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  sectionTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginBottom: 15, letterSpacing: 0.5 },
  codigoBox: { backgroundColor: '#1E1410', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FF5722' },
  codigoText: { color: '#FF5722', fontSize: 28, fontWeight: 'bold', letterSpacing: 3 },
  buttonMain: { backgroundColor: '#FF5722', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  operadorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161B22', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  operadorNombre: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  estadoContainer: { flexDirection: 'row', alignItems: 'center' },
  foco: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  operadorEstado: { fontSize: 12, fontWeight: 'bold' },
  etiquetaYo: { backgroundColor: '#FF5722', color: '#FFF', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' }
});
