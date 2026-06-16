import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, spacing, radius, fontFamily, stateColors } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";
import { useDevices } from "@/src/context/DeviceContext";
import { api } from "@/src/api/client";
import VimoMapView, { MapMarker } from "@/src/components/VimoMapView";
import { registerForPushAsync } from "@/src/utils/push";

type Event = { id: string; type: string; text: string; created_at: string; meta?: any };
type Hazard = { id: string; device_id: string; tipo_alerta: string; descripcion: string; latitud: number; longitud: number; created_at: string };

const ONLINE_WINDOW_MS = 60_000; // 60s

function shortTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

// Icon + color per event/hazard type
function eventVisual(typeOrTipo: string): { name: any; color: string; emoji?: string } {
  const t = (typeOrTipo || "").toLowerCase();
  if (t === "emergency" || t === "emergencia") return { name: "warning", color: colors.error, emoji: "🚨" };
  if (t === "choque")                          return { name: "car-sport", color: colors.error, emoji: "🚗" };
  if (t === "bache")                           return { name: "alert", color: colors.warning, emoji: "⚠️" };
  if (t === "obstaculo")                       return { name: "remove-circle", color: colors.warning, emoji: "⛔" };
  if (t === "tronco")                          return { name: "leaf", color: colors.success, emoji: "🪵" };
  if (t === "hazard")                          return { name: "alert", color: colors.warning, emoji: "⚠️" };
  if (t === "ai_response")                     return { name: "sparkles", color: colors.brand, emoji: "✨" };
  if (t === "transcript")                      return { name: "mic", color: colors.onSurfaceSecondary, emoji: "🎙" };
  if (t === "route")                           return { name: "map", color: colors.success, emoji: "🗺" };
  if (t === "info")                            return { name: "information-circle", color: colors.onSurfaceSecondary, emoji: "ℹ️" };
  return { name: "ellipse", color: colors.onSurfaceSecondary, emoji: "•" };
}

// Animated row that fades + slides in (WhatsApp-like)
function FeedRow({ item, isNew }: { item: Event; isNew: boolean }) {
  const opacity = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(isNew ? -6 : 0)).current;
  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [isNew, opacity, translateY]);

  const ic = eventVisual(item.meta?.tipo_alerta || item.type);
  return (
    <Animated.View style={[styles.feedRow, { opacity, transform: [{ translateY }] }]} testID={`feed-${item.id}`}>
      <Text style={[styles.feedEmoji, { color: ic.color }]}>{ic.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.feedText} numberOfLines={2}>{item.text}</Text>
      </View>
      <Text style={styles.feedTime}>{shortTime(item.created_at)}</Text>
    </Animated.View>
  );
}

export default function MapHome() {
  const { user } = useAuth();
  const { devices, activeDeviceId, setActiveDeviceId } = useDevices();
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const prevEventIds = useRef<Set<string>>(new Set());
  const newEventIds = useRef<Set<string>>(new Set());

  useEffect(() => { if (user) registerForPushAsync(); }, [user]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(t); }, []);

  const loadAll = useCallback(async () => {
    try {
      const [list, hz, al] = await Promise.all([api.listDevices(), api.listHazards(), api.listAlerts(true)]);
      setHazards(hz);
      setActiveAlerts(al);
      if (list[0] && (!activeDeviceId || !list.find((d: any) => d.id === activeDeviceId))) {
        setActiveDeviceId(list[0].id);
      }
    } catch {}
  }, [activeDeviceId, setActiveDeviceId]);

  const loadDeviceData = useCallback(async () => {
    if (!activeDeviceId) { setStatus(null); setEvents([]); return; }
    try {
      const [s, ev] = await Promise.all([api.getStatus(activeDeviceId), api.getEvents(activeDeviceId, 60)]);
      setStatus(s);
      // Detect newly arrived events for entrance animation
      const incoming: Event[] = ev;
      const fresh = new Set<string>();
      for (const e of incoming) {
        if (!prevEventIds.current.has(e.id)) fresh.add(e.id);
      }
      newEventIds.current = fresh;
      prevEventIds.current = new Set(incoming.map((e) => e.id));
      setEvents(incoming);
    } catch {}
  }, [activeDeviceId]);

  useFocusEffect(useCallback(() => { loadAll(); loadDeviceData(); }, [loadAll, loadDeviceData]));
  useEffect(() => {
    const t = setInterval(() => { loadAll(); loadDeviceData(); }, 4000);
    return () => clearInterval(t);
  }, [loadAll, loadDeviceData]);

  // Map markers
  const markers = useMemo<MapMarker[]>(() => {
    const out: MapMarker[] = [];
    for (const d of devices) {
      if (d.last_lat != null && d.last_lon != null) {
        const isEmerg = d.last_state === "EMERGENCIA" || activeAlerts.some((a) => a.device_id === d.id);
        out.push({
          id: d.id, lat: d.last_lat, lon: d.last_lon,
          tipo: isEmerg ? "device_emergency" : "device",
          title: d.name,
          subtitle: isEmerg ? "EMERGENCIA ACTIVA" : (d.last_state || "—"),
        });
      }
    }
    for (const h of hazards) {
      const tipo = (["bache","tronco","choque","obstaculo","emergencia"].includes(h.tipo_alerta) ? h.tipo_alerta : "otro") as any;
      out.push({
        id: h.id, lat: h.latitud, lon: h.longitud,
        tipo, title: h.descripcion, subtitle: shortTime(h.created_at),
      });
    }
    return out;
  }, [devices, hazards, activeAlerts]);

  const activeDevice = devices.find((d) => d.id === activeDeviceId);

  // Map center: active device > first marker > Tijuana
  const center = useMemo(() => {
    if (status?.lat && status?.lon) return { lat: status.lat, lon: status.lon };
    if (activeDevice?.last_lat != null && activeDevice?.last_lon != null) {
      return { lat: activeDevice.last_lat, lon: activeDevice.last_lon };
    }
    if (markers[0]) return { lat: markers[0].lat, lon: markers[0].lon };
    return { lat: 32.5149, lon: -117.0382 };
  }, [status, activeDevice, markers]);

  // 60s ONLINE/OFFLINE rule
  const onlineInfo = useMemo(() => {
    if (!activeDevice?.last_seen) return { online: false, gpsOk: false };
    const last = new Date(activeDevice.last_seen).getTime();
    const online = now - last < ONLINE_WINDOW_MS;
    const gpsOk = !!(status?.lat && status?.lon);
    return { online, gpsOk };
  }, [activeDevice, now, status]);

  const state = (status?.state || activeDevice?.last_state || "IDLE") as keyof typeof stateColors;
  const sc = stateColors[state] || stateColors.IDLE;
  const emergencyCount = activeAlerts.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="map-home">
      {/* Top status bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/selector")} style={{ marginRight: 12, justifyContent: "center" }} testID="back-to-selector">
          <Ionicons name="arrow-back" size={24} color={colors.brand} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>VIMO S3</Text>
          <Text style={styles.subtitle}>{activeDevice?.name || "Sin dispositivo"}</Text>
        </View>
        <StatusPill icon="wifi" label={onlineInfo.online ? "ONLINE" : "OFFLINE"} active={onlineInfo.online} pulse={onlineInfo.online} testID="status-online" />
        <View style={{ width: 6 }} />
        <StatusPill icon="navigate" label={onlineInfo.gpsOk ? "GPS" : "NO GPS"} active={onlineInfo.gpsOk} testID="status-gps" />
        <View style={{ width: 6 }} />
        <Pressable 
          onPress={() => router.push("/WifiConfigScreen" as any)} 
          style={{ justifyContent: "center", padding: 4 }}
          testID="wifi-config-button"
        >
          <Ionicons name="wifi" size={22} color={colors.brand} />
        </Pressable>
        <View style={{ width: 6 }} />
        <Pressable 
          onPress={() => router.push("/HistorialScreen" as any)} 
          style={{ justifyContent: "center", padding: 4 }}
          testID="history-button"
        >
          <Ionicons name="document-text-outline" size={22} color={colors.brand} />
        </Pressable>
      </View>

      {/* Device chips */}
      {devices.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          {devices.map((d) => {
            const active = d.id === activeDeviceId;
            const dotColor = d.last_state === "EMERGENCIA" ? colors.error : (d.online ? colors.success : colors.borderStrong);
            return (
              <Pressable key={d.id} onPress={() => setActiveDeviceId(d.id)} testID={`chip-${d.id}`} style={[styles.chip, active && styles.chipActive]}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <Text style={[styles.chipText, active && { color: colors.brand }]}>{d.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Map */}
      <View style={styles.mapWrap}>
        <VimoMapView
          centerLat={center.lat}
          centerLon={center.lon}
          markers={markers}
          autoZoom={markers.length > 1}
          onMarkerTap={(id) => {
            const d = devices.find((x: any) => x.id === id);
            if (d) setActiveDeviceId(d.id);
          }}
          style={{ flex: 1 }}
        />
        <View style={[styles.stateBadge, { backgroundColor: sc.bg, borderColor: sc.border }]} testID="map-state-badge">
          <Text style={[styles.stateBadgeText, { color: sc.fg }]}>{state}</Text>
        </View>
        <View style={styles.pinCount}>
          <Text style={styles.pinCountText}>{markers.length} PIN{markers.length === 1 ? "" : "ES"}</Text>
        </View>
      </View>

      {/* Feed (FlatList — historial completo, mensajes nuevos arriba) */}
      <View style={styles.feedWrap}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>HISTORIAL DE EVENTOS</Text>
          <Text style={styles.feedHint}>auto · 4s</Text>
        </View>
        {events.length === 0 ? (
          <Text style={styles.empty}>Sin eventos aún. Las alertas del VIMO aparecerán aquí en tiempo real.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(e) => e.id}
            style={{ maxHeight: 175 }}
            removeClippedSubviews={false}
            renderItem={({ item }) => <FeedRow item={item} isNew={newEventIds.current.has(item.id)} />}
          />
        )}
      </View>

      {/* Bottom panic/monitor button */}
      <Pressable
        testID="emergency-monitor-button"
        onPress={() => router.push("/(tabs)/alerts")}
        style={({ pressed }) => [
          styles.bottomBtn,
          emergencyCount > 0 ? styles.bottomBtnActive : null,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={{ fontSize: 18 }}>🚨</Text>
        <Text style={styles.bottomBtnText}>
          {emergencyCount > 0 ? `${emergencyCount} ALERTA${emergencyCount > 1 ? "S" : ""} ACTIVA${emergencyCount > 1 ? "S" : ""}` : "MONITOR DE EMERGENCIAS"}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function StatusPill({ icon, label, active, pulse, testID }: { icon: any; label: string; active: boolean; pulse?: boolean; testID?: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!pulse || !active) { opacity.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, active, opacity]);
  return (
    <View testID={testID} style={[styles.pill, { borderColor: active ? colors.success : colors.error, backgroundColor: active ? "#052E1633" : "#7F1D1D33" }]}>
      <Animated.View style={[styles.pillDot, { backgroundColor: active ? colors.success : colors.error, opacity: pulse ? opacity : 1 }]} />
      <Ionicons name={icon} size={11} color={active ? colors.success : colors.error} />
      <Text style={[styles.pillText, { color: active ? colors.success : colors.error }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 4 },
  brand: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 22, letterSpacing: 2 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11, marginTop: 2 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, height: 28, borderRadius: 14, borderWidth: 1 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1 },
  chipsRow: { maxHeight: 50 },
  chip: { flexDirection: "row", alignItems: "center", flexShrink: 0, paddingHorizontal: spacing.md, height: 32, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, gap: 6 },
  chipActive: { borderColor: colors.brand, backgroundColor: colors.brandSecondary },
  dot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.textBold, fontSize: 11, letterSpacing: 0.5 },
  mapWrap: { flex: 1, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border, minHeight: 280, position: "relative" },
  stateBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1 },
  stateBadgeText: { fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1.5 },
  pinCount: { position: "absolute", top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm, backgroundColor: "rgba(12,13,15,0.85)", borderWidth: 1, borderColor: colors.border },
  pinCountText: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1 },
  feedWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  feedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: spacing.xs },
  feedTitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 2 },
  feedHint: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 10 },
  feedRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  feedEmoji: { fontSize: 17, marginTop: 1 },
  feedText: { color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 13, lineHeight: 18 },
  feedTime: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 10, marginTop: 2 },
  empty: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 12, paddingVertical: spacing.md, textAlign: "center" },
  bottomBtn: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, borderRadius: radius.md, backgroundColor: "#7F1D1D", borderWidth: 1, borderColor: colors.error },
  bottomBtnActive: { backgroundColor: colors.error },
  bottomBtnText: { flex: 1, color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 13, letterSpacing: 1.5 },
});
