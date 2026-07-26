import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProjectSelector() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.title}>CENTRO DE MANDO</Text>
      <Text style={styles.subtitle}>Selecciona el sistema de hardware al que deseas conectarte</Text>

      {/* Opción 1: Vimo Portátil */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/(tabs)")}
      >
        <View style={styles.badgeActivo}><Text style={styles.badgeText}>ONLINE</Text></View>
        <Text style={styles.cardTitle}>VIMO Portátil</Text>
        <Text style={styles.cardDesc}>Sistema asistente personal, monitoreo de pines y rastreo GPS.</Text>
      </TouchableOpacity>

      {/* Opción 2: Viviendas Seguras */}
      <TouchableOpacity
        style={styles.cardSecondary}
        onPress={() => router.push("/viviendas")}
      >
        <View style={styles.badgeStandby}><Text style={styles.badgeText}>STANDBY</Text></View>
        <Text style={styles.cardTitle}>Viviendas Seguras</Text>
        <Text style={styles.cardDesc}>Panel de control domótico: sensores de gas, alertas y automatización de ventanas.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1128",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    color: "#00E5FF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    letterSpacing: 2,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#101B3B",
    borderWidth: 1,
    borderColor: "#00E5FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    position: "relative",
  },
  cardSecondary: {
    backgroundColor: "#101B3B",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
    position: "relative",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDesc: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  badgeActivo: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0, 255, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#00FF00",
  },
  badgeStandby: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
