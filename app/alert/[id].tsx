import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fontFamily } from "@/src/theme";
import { api } from "@/src/api/client";
import VimoMapView from "@/src/components/VimoMapView";

function formatTime(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

export default function AlertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [alert, setAlert] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try { setAlert(await api.getAlert(id)); } catch {}
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onAck = async () => {
    if (!id) return;
    setBusy(true);
    try { setAlert(await api.acknowledgeAlert(id)); } finally { setBusy(false); }
  };
  const onResolve = async () => {
    if (!id) return;
    setBusy(true);
    try { setAlert(await api.resolveAlert(id)); } finally { setBusy(false); }
  };
  const openMaps = () => {
    if (alert?.google_maps_url) Linking.openURL(alert.google_maps_url);
    else if (alert?.lat && alert?.lon) Linking.openURL(`https://maps.google.com/?q=${alert.lat},${alert.lon}`);
  };

  if (!alert) {
    return <SafeAreaView style={styles.safe}><ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xl }} /></SafeAreaView>;
  }

  const markers = alert.lat != null ? [{
    id: alert.id, lat: alert.lat, lon: alert.lon,
    tipo: "device_emergency" as const,
    title: alert.device_name, subtitle: "ALERTA",
  }] : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="alert-detail-screen">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} testID="back-btn"><Ionicons name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.title}>DETALLE DE ALERTA</Text>
          <Text style={styles.subtitle}>{alert.device_name} · {formatTime(alert.created_at)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}>
        {/* 911 DISPATCH BANNER (simulated) */}
        {alert.dispatched_911 ? (
          <View style={styles.dispatchBanner} testID="dispatch-911-banner">
            <View style={styles.dispatchRow}>
              <Text style={styles.dispatchEmoji}>🚨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dispatchTitle}>911 NOTIFICADO</Text>
                <Text style={styles.dispatchStatus}>{alert.dispatch_status || "Notificada a autoridades"}</Text>
              </View>
              {alert.incident_id ? (
                <View style={styles.incidentTag}>
                  <Text style={styles.incidentTagLabel}>INCIDENTE</Text>
                  <Text style={styles.incidentTagValue}>{alert.incident_id}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.dispatchHint}>
              ⓘ El botón de pánico físico del VIMO disparó esta alerta. En producción, este flujo se conecta al sistema oficial del C5 / 911 — actualmente en MODO SIMULACIÓN para validación.
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>RESUMEN IA · CLAUDE SONNET 4.5</Text>
          <Text style={styles.summaryText}>{alert.summary}</Text>
        </View>

        {markers.length ? (
          <View style={styles.mapBox}>
            <VimoMapView centerLat={alert.lat} centerLon={alert.lon} markers={markers} style={{ flex: 1 }} />
          </View>
        ) : null}

        {alert.lat != null ? (
          <Pressable onPress={openMaps} style={styles.linkRow}>
            <Ionicons name="navigate-outline" size={16} color={colors.brand} />
            <Text style={styles.linkText}>📍 {alert.lat.toFixed(5)}, {alert.lon.toFixed(5)} · ABRIR EN GOOGLE MAPS</Text>
          </Pressable>
        ) : null}

        <Text style={styles.section}>DETONANTE</Text>
        <View style={styles.triggerBox}><Text style={styles.triggerText}>{alert.trigger_text}</Text></View>

        <View style={{ height: spacing.lg }} />
        {alert.status === "active" ? (
          <Pressable testID="acknowledge-btn" onPress={onAck} disabled={busy} style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && { opacity: 0.85 }]}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ESTOY EN CAMINO</Text>}
          </Pressable>
        ) : null}
        {alert.status !== "resolved" ? (
          <Pressable testID="resolve-btn" onPress={onResolve} disabled={busy} style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && { opacity: 0.85 }]}>
            {busy ? <ActivityIndicator color={colors.success} /> : <Text style={[styles.btnText, { color: colors.success }]}>MARCAR RESUELTA</Text>}
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 20, letterSpacing: 1.5 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11, marginTop: 2 },
  summaryCard: { backgroundColor: "#7F1D1D33", borderWidth: 1, borderColor: colors.error, borderRadius: radius.lg, padding: spacing.lg },
  summaryLabel: { color: colors.error, fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 2 },
  summaryText: { color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  mapBox: { height: 220, marginTop: spacing.lg, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md, paddingVertical: spacing.sm },
  linkText: { color: colors.brand, fontFamily: fontFamily.displayBold, fontSize: 12, letterSpacing: 1 },
  section: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 2, marginTop: spacing.lg, marginBottom: spacing.xs },
  triggerBox: { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  triggerText: { color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 13 },
  btn: { paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: "center", marginTop: spacing.sm },
  btnPrimary: { backgroundColor: colors.brand },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.success },
  btnText: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 13, letterSpacing: 1.5 },
  dispatchBanner: { backgroundColor: "#EF4444", borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 2, borderColor: "#FCA5A5" },
  dispatchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dispatchEmoji: { fontSize: 36 },
  dispatchTitle: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 22, letterSpacing: 2 },
  dispatchStatus: { color: "#FFE4E6", fontFamily: fontFamily.textBold, fontSize: 12, marginTop: 2 },
  incidentTag: { backgroundColor: "#0C0D0F", borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center" },
  incidentTagLabel: { color: "#FCA5A5", fontFamily: fontFamily.displayBold, fontSize: 9, letterSpacing: 1.5 },
  incidentTagValue: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 13, letterSpacing: 1 },
  dispatchHint: { color: "#FECACA", fontFamily: fontFamily.text, fontSize: 11, lineHeight: 16, marginTop: spacing.md },
});
