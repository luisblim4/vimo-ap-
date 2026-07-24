import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

// 1. Tipamos la estructura de los datos del equipo
interface TeamMember {
  id: string;
  name: string;
  role: string;
}

// 2. Tipamos explícitamente el componente funcional
const EquipoScreen: React.FC = () => {
  // Datos tipados con la interfaz
  const teamData: TeamMember[] = [
    { id: '1', name: 'Luis', role: 'Líder de Proyecto & Arquitectura Software' },
    { id: '2', name: 'Dylan', role: 'Ingeniería de Hardware & Circuitos' },
    { id: '3', name: 'Epitacio', role: 'Desarrollo Backend & Base de Datos' },
    { id: '4', name: 'Santiago', role: 'Desarrollo Frontend React Native' },
    { id: '5', name: 'Edgar', role: 'Integración IA & Documentación' },
  ];

  const renderItem = ({ item }: { item: TeamMember }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.role}>{item.role}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equipo Vimo S3</Text>
      <FlatList
        data={teamData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 24, color: '#00ff00', fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  name: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  role: { fontSize: 14, color: '#aaa', marginTop: 5 },
});

export default EquipoScreen;
