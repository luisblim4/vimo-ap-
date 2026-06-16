import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function ProjectSelector() {
  return (
    <View style={styles.container}>
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
        <View style={styles.badgeInactivo}><Text style={styles.badgeText}>STANDBY</Text></View>
        <Text style={styles.cardTitle}>Viviendas Seguras</Text>
        <Text style={styles.cardDesc}>Panel de control domótico: sensores de gas, alertas y automatización de ventanas.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    letterSpacing: 2,
  },
  subtitle: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#FF4500",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    position: "relative",
  },
  cardSecondary: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
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
    color: "#AAAAAA",
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
  },
  badgeInactivo: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
