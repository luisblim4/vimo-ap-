import React, { useRef, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fontFamily } from "@/src/theme";
import { useDevices } from "@/src/context/DeviceContext";
import { api } from "@/src/api/client";

export default function Controls() {
  const router = useRouter();
  const { activeDeviceId, devices } = useDevices();
  const [toast, setToast] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<string>(colors.success);
  const [speakText, setSpeakText] = useState("");
  const [routeDest, setRouteDest] = useState("Tijuana Centro");
  const [busy, setBusy] = useState<string | null>(null);
  const emergencyProgress = useRef(new Animated.Value(0)).current;
  const emergencyTimer = useRef<any>(null);

  const showToast = (msg: string, color = colors.success) => {
    setToast(msg);
    setToastColor(color);
    setTimeout(() => setToast(null), 2500);
  };

  const send = async (type: string, payload?: any, key?: string) => {
    if (!activeDeviceId) return showToast("Vincula un dispositivo primero", colors.error);
    setBusy(key || type);
    try {
      await api.enqueueCommand(activeDeviceId, type, payload);
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast(`Comando "${type}" enviado`);
    } catch (e: any) {
      showToast(e?.message || "Falló el envío", colors.error);
    } finally {
      setBusy(null);
    }
  };

  const startEmergencyHold = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(emergencyProgress, {
      toValue: 1, duration: 2000, useNativeDriver: false,
    }).start();
    emergencyTimer.current = setTimeout(async () => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await send("emergency", { source: "mobile" }, "emergency");
    }, 2050);
  };
  const cancelEmergencyHold = () => {
    if (emergencyTimer.current) clearTimeout(emergencyTimer.current);
    Animated.timing(emergencyProgress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const widthInterpolate = emergencyProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="controls-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
            <Pressable onPress={() => router.push("/selector")} style={{ justifyContent: "center" }} testID="back-to-selector">
              <Ionicons name="arrow-back" size={26} color={colors.brand} />
            </Pressable>
            <Text style={[styles.title, { marginBottom: 0 }]}>CONTROLS</Text>
          </View>
          <Text style={styles.subtitle}>
            {devices.find((d) => d.id === activeDeviceId)?.name || "Sin dispositivo activo"}
          </Text>

          {/* Emergency button */}
          <Text style={[styles.label, { marginTop: spacing.xl }]}>BOTÓN DE EMERGENCIA</Text>
          <Text style={styles.hint}>Mantén presionado 2 segundos para activar</Text>
          <Pressable
            testID="emergency-button"
            onPressIn={startEmergencyHold}
            onPressOut={cancelEmergencyHold}
            disabled={!activeDeviceId || busy === "emergency"}
            style={({ pressed }) => [
              styles.emergencyBtn,
              !activeDeviceId && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <Animated.View style={[styles.emergencyFill, { width: widthInterpolate }]} />
            <View style={styles.emergencyContent}>
              <Ionicons name="warning" size={36} color="#fff" />
              <Text style={styles.emergencyText}>EMERGENCY</Text>
              <Text style={styles.emergencySub}>MANTÉN PARA CONFIRMAR</Text>
            </View>
          </Pressable>

          {/* Speak */}
          <Text style={[styles.label, { marginTop: spacing.xl }]}>ENVIAR MENSAJE (TTS)</Text>
          <TextInput
            testID="speak-input"
            value={speakText}
            onChangeText={setSpeakText}
            placeholder='ej: "Te estamos siguiendo, mantén la calma"'
            placeholderTextColor={colors.onSurfaceSecondary}
            style={styles.input}
            multiline
          />
          <Pressable
            testID="speak-send-button"
            disabled={!speakText.trim() || busy === "speak"}
            onPress={() => { send("speak", { text: speakText.trim(), lang: "es-MX" }, "speak"); setSpeakText(""); }}
            style={({ pressed }) => [styles.btn, (!speakText.trim() || busy === "speak") && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
          >
            {busy === "speak" ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>HABLAR EN EL DISPOSITIVO</Text>}
          </Pressable>

          {/* Route */}
          <Text style={[styles.label, { marginTop: spacing.xl }]}>SOLICITAR RUTA</Text>
          <TextInput
            testID="route-input"
            value={routeDest}
            onChangeText={setRouteDest}
            placeholder="Destino (ej: Plaza Rio Tijuana)"
            placeholderTextColor={colors.onSurfaceSecondary}
            style={styles.input}
          />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable
              testID="route-walking-button"
              disabled={!routeDest.trim() || busy === "route-walk"}
              onPress={() => send("route", { mode: "walking", destination: routeDest.trim() }, "route-walk")}
              style={({ pressed }) => [styles.btn, styles.btnSecondary, { flex: 1 }, pressed && { opacity: 0.85 }]}
            >
              {busy === "route-walk" ? <ActivityIndicator color={colors.brand} /> : <Text style={[styles.btnText, { color: colors.brand }]}>A PIE</Text>}
            </Pressable>
            <Pressable
              testID="route-driving-button"
              disabled={!routeDest.trim() || busy === "route-drive"}
              onPress={() => send("route", { mode: "driving", destination: routeDest.trim() }, "route-drive")}
              style={({ pressed }) => [styles.btn, { flex: 1 }, pressed && { opacity: 0.85 }]}
            >
              {busy === "route-drive" ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>EN AUTO</Text>}
            </Pressable>
          </View>

          {/* Reboot */}
          <Text style={[styles.label, { marginTop: spacing.xl }]}>OPERACIONES</Text>
          <Pressable
            testID="reboot-button"
            disabled={busy === "reboot"}
            onPress={() => send("reboot", {}, "reboot")}
            style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && { opacity: 0.85 }]}
          >
            {busy === "reboot" ? <ActivityIndicator color={colors.brand} /> : <Text style={[styles.btnText, { color: colors.brand }]}>REINICIAR DISPOSITIVO</Text>}
          </Pressable>
        </ScrollView>

        {toast ? (
          <View style={[styles.toast, { borderColor: toastColor }]} testID="controls-toast">
            <Text style={[styles.toastText, { color: toastColor }]}>{toast}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  title: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 28, letterSpacing: 2 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 12, marginTop: 2 },
  label: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1.5, marginBottom: spacing.xs },
  hint: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 12, marginBottom: spacing.sm },
  emergencyBtn: {
    height: 160, borderRadius: radius.lg, backgroundColor: "#7F1D1D", overflow: "hidden",
    borderWidth: 2, borderColor: colors.error, justifyContent: "center", alignItems: "center",
  },
  emergencyFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: colors.error },
  emergencyContent: { alignItems: "center" },
  emergencyText: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 32, letterSpacing: 4, marginTop: spacing.xs },
  emergencySub: { color: "#FCA5A5", fontFamily: fontFamily.text, fontSize: 11, letterSpacing: 2, marginTop: 4 },
  input: {
    backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
    color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 14,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md,
    marginBottom: spacing.md, minHeight: 48,
  },
  btn: {
    backgroundColor: colors.brand, paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: "center",
  },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.brand },
  btnText: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 13, letterSpacing: 1.5 },
  toast: {
    position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.xl,
    backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderRadius: radius.md, padding: spacing.md,
  },
  toastText: { fontFamily: fontFamily.textBold, fontSize: 13 },
});
