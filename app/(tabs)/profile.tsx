// @ts-nocheck
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, AppState,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing, radius, fontFamily } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";
import { useDevices } from "@/src/context/DeviceContext";
import { api, API_BASE } from "@/src/api/client";

// Firebase imports
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function Profile() {
  const { user, logout } = useAuth();
  const { devices, refresh, setActiveDeviceId, activeDeviceId } = useDevices();
  const router = useRouter();
  const [name, setName] = useState("VIMO S3");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Radar states
  const [codigoEnlace, setCodigoEnlace] = useState('');
  const [operadores, setOperadores] = useState<any[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const appState = useRef(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    let apagarRadar: (() => void) | undefined;

    // Función maestra para guardar nuestro estado en internet
    const reportarEstado = async (usuario: any, estadoActual: string) => {
      if (usuario) {
        const miExpediente = doc(db, 'operadores', usuario.uid);
        await setDoc(miExpediente, {
          correo: usuario.email,
          state: estadoActual, // mapping state for database schema if needed, but keeping original 'estado' key as specified in instruction
          estado: estadoActual,
          ultimaConexion: serverTimestamp()
        }, { merge: true });
      }
    };

    // 1. ESPERAMOS A QUE FIREBASE CONFIRME QUIÉN SOMOS
    const vigilarSesion = onAuthStateChanged(auth, (usuarioVerificado) => {
      if (usuarioVerificado) {
        setUsuarioActual(usuarioVerificado);
        
        // Ahora sí, ya sabemos quiénes somos. Nos ponemos "En línea"
        reportarEstado(usuarioVerificado, 'en línea');

        // 2. PRENDEMOS EL RADAR PARA VER A LOS DEMÁS
        const referenciaEquipo = collection(db, 'operadores');
        apagarRadar = onSnapshot(referenciaEquipo, (snapshot) => {
          const listaEquipo: any[] = [];
          snapshot.forEach((documento) => {
            listaEquipo.push({ id: documento.id, ...documento.data() });
          });
          setOperadores(listaEquipo);
        });
      }
    });

    // Detectar si sales de la app a contestar un mensaje
    const monitorApp = AppState.addEventListener('change', (estadoSiguiente) => {
      if (appState.current.match(/inactive|background/) && estadoSiguiente === 'active') {
        if (auth.currentUser) reportarEstado(auth.currentUser, 'en línea');
      } else if (estadoSiguiente.match(/inactive|background/)) {
        if (auth.currentUser) reportarEstado(auth.currentUser, 'desconectado');
      }
      appState.current = estadoSiguiente;
    });

    // Limpieza al cerrar
    return () => {
      vigilarSesion(); // Apagamos el vigilante
      if (apagarRadar) apagarRadar();
      if (auth.currentUser) reportarEstado(auth.currentUser, 'desconectado');
      monitorApp.remove();
    };
  }, []);

  const generarCodigo = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'VIMO-';
    for (let i = 0; i < 5; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setCodigoEnlace(codigo);
    Alert.alert('Código de Seguridad', `Código generado: ${codigo}`);
  };

  const onCreate = () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ingresa un nombre para el dispositivo");
      return;
    }
    router.push({
      pathname: "/edit-profile",
      params: { mandatory: "true", origin: "profile", deviceName: trimmed }
    });
    setName("VIMO S3");
  };

  const onDelete = async (id: string) => {
    try {
      await api.deleteDevice(id);
      await refresh();
    } catch {}
  };

  const copy = async (key: string, label: string) => {
    await Clipboard.setStringAsync(key);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="profile-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
            <Pressable onPress={() => router.push("/selector")} style={{ justifyContent: "center" }} testID="back-to-selector">
              <Ionicons name="arrow-back" size={26} color={colors.brand} />
            </Pressable>
            <Text style={[styles.title, { marginBottom: 0 }]}>PROFILE</Text>
          </View>

          <View style={styles.userCard}>
            <Ionicons name="person-circle-outline" size={42} color={colors.brand} />
            <View>
              <Text style={styles.userEmail}>{user?.email || usuarioActual?.email || 'Cargando sesión...'}</Text>
              <Text style={styles.userId}>ID: {(user?.id || usuarioActual?.uid)?.slice(0, 8)}…</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>VINCULAR DISPOSITIVO</Text>
          <TextInput
            testID="device-name-input"
            value={name}
            onChangeText={setName}
            placeholder="Nombre del dispositivo"
            placeholderTextColor={colors.onSurfaceSecondary}
            style={styles.input}
          />
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Pressable
            testID="create-device-button"
            disabled={creating}
            onPress={onCreate}
            style={({ pressed }) => [styles.btn, creating && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}
          >
            {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>GENERAR CREDENCIAL</Text>}
          </Pressable>

          <Pressable
            testID="pair-ble-button"
            onPress={() => router.push("/WifiConfigScreen" as any)}
            style={({ pressed }) => [styles.bleBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="bluetooth" size={16} color={colors.brand} />
            <Text style={styles.bleBtnText}>CONFIGURAR WIFI POR BLUETOOTH (BLE)</Text>
          </Pressable>

          <Pressable
            testID="view-history-button"
            onPress={() => router.push("/HistorialScreen" as any)}
            style={({ pressed }) => [styles.bleBtn, { marginTop: spacing.sm }, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="document-text-outline" size={16} color={colors.brand} />
            <Text style={styles.bleBtnText}>VER BITÁCORA DE OPERACIONES</Text>
          </Pressable>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>DISPOSITIVOS ({devices.length})</Text>
          {devices.length === 0 ? (
            <Text style={styles.empty}>No tienes dispositivos vinculados aún.</Text>
          ) : null}
          {devices.map((d) => {
            const active = d.id === activeDeviceId;
            return (
              <View key={d.id} style={[styles.deviceCard, active && { borderColor: colors.brand }]} testID={`device-card-${d.id}`}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <View style={[styles.dot, { backgroundColor: d.online ? colors.success : colors.borderStrong }]} />
                    <Text style={styles.deviceName}>{d.name}</Text>
                  </View>
                  <Pressable onPress={() => setActiveDeviceId(d.id)} testID={`activate-${d.id}`}>
                    <Text style={[styles.linkText, { color: active ? colors.brand : colors.onSurfaceSecondary }]}>
                      {active ? "ACTIVO" : "ACTIVAR"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>DEVICE ID</Text>
                  <Pressable onPress={() => copy(d.id, "id-" + d.id)} testID={`copy-id-${d.id}`}>
                    <Text style={styles.kvValueMono}>
                      {d.id} {copied === "id-" + d.id ? "✓" : "⧉"}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>API KEY</Text>
                  <Pressable onPress={() => copy(d.api_key, "k-" + d.id)} testID={`copy-key-${d.id}`}>
                    <Text style={styles.kvValueMono} numberOfLines={1}>
                      {d.api_key.slice(0, 14)}… {copied === "k-" + d.id ? "✓" : "⧉"}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>API BASE</Text>
                  <Pressable onPress={() => copy(API_BASE, "b-" + d.id)} testID={`copy-base-${d.id}`}>
                    <Text style={styles.kvValueMono} numberOfLines={1}>
                      {API_BASE.replace(/^https?:\/\//, "")} {copied === "b-" + d.id ? "✓" : "⧉"}
                    </Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => onDelete(d.id)} testID={`delete-${d.id}`} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                  <Text style={styles.deleteText}>ELIMINAR</Text>
                </Pressable>

                <Pressable onPress={() => router.push(`/edit-profile?deviceId=${d.id}`)} testID={`profile-${d.id}`} style={styles.profileBtn}>
                  <Ionicons name="person-outline" size={14} color={colors.brand} />
                  <Text style={styles.profileBtnText}>EDITAR PERFIL DEL PORTADOR</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.brand} />
                </Pressable>
              </View>
            );
          })}

          {/* Radar Section */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>RED MULTI-USUARIO</Text>
          <View style={styles.panel}>
            {codigoEnlace !== '' && (
              <View style={styles.codigoBox}>
                <Text style={styles.codigoText}>{codigoEnlace}</Text>
              </View>
            )}
            <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]} onPress={generarCodigo}>
              <Text style={styles.btnText}>GENERAR INVITACIÓN</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>RADAR DEL EQUIPO EN VIVO</Text>
          {operadores.length === 0 ? (
            <Text style={styles.empty}>Buscando operadores...</Text>
          ) : (
            operadores.map((op) => {
              const enLinea = op.estado === 'en línea';
              return (
                <View key={op.id} style={styles.operadorCard}>
                  <View>
                    <Text style={styles.operadorNombre}>{op.correo}</Text>
                    <View style={styles.estadoContainer}>
                      <View style={[styles.foco, { backgroundColor: enLinea ? '#4CAF50' : '#555' }]} />
                      <Text style={[styles.operadorEstado, { color: enLinea ? '#4CAF50' : '#888' }]}>
                        {enLinea ? 'En línea' : 'Desconectado'}
                      </Text>
                    </View>
                  </View>
                  {(auth.currentUser?.email || usuarioActual?.email) === op.correo && <Text style={styles.etiquetaYo}>TÚ</Text>}
                </View>
              );
            })
          )}

          <Pressable testID="logout-button" onPress={logout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  title: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 28, letterSpacing: 2 },
  userCard: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md,
  },
  userEmail: { color: colors.onSurface, fontFamily: fontFamily.textBold, fontSize: 14 },
  userId: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 12, letterSpacing: 2, marginTop: spacing.xl, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
    color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 14,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm,
  },
  err: { color: colors.error, fontFamily: fontFamily.text, fontSize: 12, marginBottom: spacing.sm },
  btn: { backgroundColor: colors.brand, paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: "center" },
  btnText: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 13, letterSpacing: 1.5 },
  deviceCard: {
    backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  deviceName: { color: colors.onSurface, fontFamily: fontFamily.textBold, fontSize: 14 },
  linkText: { fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1.5 },
  kvRow: { marginTop: spacing.sm },
  kvLabel: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1.5 },
  kvValueMono: { color: colors.onSurface, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, marginTop: 2 },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md, alignSelf: "flex-start" },
  deleteText: { color: colors.error, fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1 },
  profileBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.brand, borderRadius: radius.sm, backgroundColor: colors.brandSecondary },
  profileBtnText: { flex: 1, color: colors.brand, fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1.5 },
  empty: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 13, marginBottom: spacing.sm },
  logoutBtn: {
    marginTop: spacing.xl, borderWidth: 1, borderColor: colors.error, paddingVertical: spacing.md,
    borderRadius: radius.md, alignItems: "center",
  },
  logoutText: { color: colors.error, fontFamily: fontFamily.displayBold, letterSpacing: 1.5 },
  bleBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    marginTop: spacing.sm, 
    paddingVertical: spacing.md, 
    borderWidth: 1, 
    borderColor: colors.brand, 
    borderRadius: radius.md, 
    backgroundColor: "rgba(255, 69, 0, 0.05)" 
  },
  bleBtnText: { 
    color: colors.brand, 
    fontFamily: fontFamily.displayBold, 
    fontSize: 12, 
    letterSpacing: 1.5 
  },
  panel: { marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  codigoBox: { backgroundColor: '#1E1410', padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.brand },
  codigoText: { color: colors.brand, fontSize: 18, fontFamily: fontFamily.displayBold, letterSpacing: 2 },
  operadorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSecondary, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  operadorNombre: { color: colors.onSurface, fontFamily: fontFamily.textBold, fontSize: 13 },
  estadoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  foco: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  operadorEstado: { fontSize: 11, fontFamily: fontFamily.textBold },
  etiquetaYo: { backgroundColor: colors.brand, color: '#FFF', fontSize: 9, fontFamily: fontFamily.displayBold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }
});
