import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fontFamily } from "@/src/theme";
import { api } from "@/src/api/client";

type Alert = {
  id: string; device_id: string; device_name: string;
  status: "active" | "acknowledged" | "resolved";
  summary: string; lat?: number; lon?: number; location_label?: string;
  google_maps_url?: string; trigger_text: string; created_at: string;
  dispatched_911?: boolean; dispatch_status?: string; incident_id?: string;
};

function statusColor(s: string) {
  if (s === "active") return colors.error;
  if (s === "acknowledged") return colors.warning;
  return colors.success;
}

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }); }
  catch { return iso; }
}

export default function AlertsTab() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.listAlerts()); } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="alerts-screen">
      <View style={[styles.header, { flexDirection: "row", alignItems: "center", gap: spacing.md }]}>
        <Pressable onPress={() => router.push("/selector")} style={{ justifyContent: "center" }} testID="back-to-selector">
          <Ionicons name="arrow-back" size={26} color={colors.brand} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>ALERTAS</Text>
          <Text style={styles.subtitle}>resúmenes generados por Claude Sonnet 4.5</Text>
        </View>
      </View>
      {loading && items.length === 0 ? <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xl }} /> : null}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing["3xl"] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Ionicons name="shield-checkmark-outline" size={48} color={colors.success} />
            <Text style={styles.emptyTitle}>SIN ALERTAS</Text>
            <Text style={styles.emptyText}>Cuando el VIMO active el botón de pánico o detecte una emergencia aparecerá aquí con un resumen IA.</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <Pressable
            testID={`alert-${item.id}`}
            onPress={() => router.push(`/alert/${item.id}`)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
              <Text style={[styles.statusLabel, { color: statusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
              {item.dispatched_911 ? (
                <View style={styles.badge911}>
                  <Text style={styles.badge911Text}>🚨 911</Text>
                </View>
              ) : null}
              <Text style={styles.cardTime}>{formatTime(item.created_at)}</Text>
            </View>
            <Text style={styles.cardDevice}>{item.device_name}{item.incident_id ? ` · ${item.incident_id}` : ""}</Text>
            <Text style={styles.summary} numberOfLines={4}>{item.summary}</Text>
            {item.lat != null && item.lon != null ? (
              <Text style={styles.coords}>📍 {item.lat.toFixed(4)}, {item.lon.toFixed(4)}{item.location_label ? ` · ${item.location_label}` : ""}</Text>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 28, letterSpacing: 2 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1.5 },
  cardTime: { marginLeft: "auto", color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11 },
  badge911: { backgroundColor: colors.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badge911Text: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1 },
  cardDevice: { marginTop: 4, color: colors.onSurface, fontFamily: fontFamily.textBold, fontSize: 13 },
  summary: { marginTop: spacing.sm, color: colors.onSurfaceTertiary, fontFamily: fontFamily.text, fontSize: 13, lineHeight: 19 },
  coords: { marginTop: spacing.sm, color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11 },
  empty: { alignItems: "center", marginTop: spacing["3xl"], paddingHorizontal: spacing.xl, gap: spacing.sm },
  emptyTitle: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 14, letterSpacing: 2 },
  emptyText: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, textAlign: "center", lineHeight: 19 },
});
