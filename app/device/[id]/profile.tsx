import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, fontFamily } from "@/src/theme";
import { api } from "@/src/api/client";
import { useDevices } from "@/src/context/DeviceContext";

type Profile = {
  nombre_completo: string;
  edad: string;                 // keep as string in form, convert to number on save
  genero: string;
  discapacidades: string[];
  tipo_sangre: string;
  condiciones_medicas: string[];
  alergias: string;
  medicamentos: string;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_relacion: string;
  direccion: string;
  notas: string;
};

const EMPTY: Profile = {
  nombre_completo: "", edad: "", genero: "", discapacidades: [],
  tipo_sangre: "", condiciones_medicas: [], alergias: "", medicamentos: "",
  contacto_nombre: "", contacto_telefono: "", contacto_relacion: "",
  direccion: "", notas: "",
};

const GENEROS: { key: string; label: string }[] = [
  { key: "masculino", label: "Masculino" },
  { key: "femenino", label: "Femenino" },
  { key: "no_binario", label: "No binario" },
  { key: "prefiero_no_decir", label: "Prefiero no decir" },
];

const DISCAPACIDADES = ["visual", "auditiva", "motriz", "cognitiva", "habla", "otra"];
const CONDICIONES = ["diabetes", "epilepsia", "cardiaca", "hipertension", "asma", "otra"];
const TIPOS_SANGRE = ["A+","A-","B+","B-","O+","O-","AB+","AB-","?"];

export default function DeviceProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { devices } = useDevices();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const device = devices.find((d) => d.id === id);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await api.getDeviceProfile(id);
      setProfile({
        nombre_completo: p.nombre_completo || "",
        edad: p.edad != null ? String(p.edad) : "",
        genero: p.genero || "",
        discapacidades: p.discapacidades || [],
        tipo_sangre: p.tipo_sangre || "",
        condiciones_medicas: p.condiciones_medicas || [],
        alergias: p.alergias || "",
        medicamentos: p.medicamentos || "",
        contacto_nombre: p.contacto_nombre || "",
        contacto_telefono: p.contacto_telefono || "",
        contacto_relacion: p.contacto_relacion || "",
        direccion: p.direccion || "",
        notas: p.notas || "",
      });
    } catch {} finally { setLoading(false); }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleArray = (field: "discapacidades" | "condiciones_medicas", value: string) => {
    setProfile((p) => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: any = { ...profile };
      payload.edad = profile.edad ? parseInt(profile.edad, 10) : null;
      if (!profile.genero) payload.genero = null;
      if (!profile.tipo_sangre || profile.tipo_sangre === "?") payload.tipo_sangre = null;
      // Strip empty strings to null
      for (const k of Object.keys(payload)) {
        if (typeof payload[k] === "string" && payload[k].trim() === "") payload[k] = null;
      }
      await api.upsertDeviceProfile(id, payload);
      setToast("Perfil guardado ✓");
      setTimeout(() => setToast(null), 2500);
    } catch (e: any) {
      setToast(e?.message || "Error al guardar");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="device-profile-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} testID="back-btn"><Ionicons name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.title}>PERFIL DEL PORTADOR</Text>
            <Text style={styles.subtitle}>{device?.name || "Dispositivo"}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xl }} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}>
            <Section title="DATOS PERSONALES">
              <Field label="Nombre completo">
                <TextInput testID="input-nombre" value={profile.nombre_completo} onChangeText={(v) => setProfile({ ...profile, nombre_completo: v })} placeholder="Ej. Juan Pérez Hernández" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
              </Field>
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Field label="Edad">
                    <TextInput testID="input-edad" value={profile.edad} onChangeText={(v) => setProfile({ ...profile, edad: v.replace(/[^0-9]/g, "") })} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
                  </Field>
                </View>
                <View style={{ flex: 2 }}>
                  <Field label="Género">
                    <ChipRow options={GENEROS.map(g => ({ key: g.key, label: g.label }))} selected={profile.genero} onChange={(k) => setProfile({ ...profile, genero: k === profile.genero ? "" : k })} testIDPrefix="genero" />
                  </Field>
                </View>
              </View>
            </Section>

            <Section title="DISCAPACIDADES (opcional, marca las que apliquen)">
              <MultiChipRow options={DISCAPACIDADES} selected={profile.discapacidades} onToggle={(v) => toggleArray("discapacidades", v)} testIDPrefix="disc" />
            </Section>

            <Section title="CONDICIÓN MÉDICA">
              <Field label="Tipo de sangre">
                <ChipRow options={TIPOS_SANGRE.map(t => ({ key: t, label: t }))} selected={profile.tipo_sangre} onChange={(k) => setProfile({ ...profile, tipo_sangre: k === profile.tipo_sangre ? "" : k })} testIDPrefix="sangre" />
              </Field>
              <Field label="Condiciones médicas (selecciona varias)">
                <MultiChipRow options={CONDICIONES} selected={profile.condiciones_medicas} onToggle={(v) => toggleArray("condiciones_medicas", v)} testIDPrefix="cond" />
              </Field>
              <Field label="Alergias">
                <TextInput testID="input-alergias" value={profile.alergias} onChangeText={(v) => setProfile({ ...profile, alergias: v })} placeholder="Ej. Penicilina, mariscos" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
              </Field>
              <Field label="Medicamentos que toma">
                <TextInput testID="input-medicamentos" value={profile.medicamentos} onChangeText={(v) => setProfile({ ...profile, medicamentos: v })} placeholder="Ej. Metformina 850mg c/12h" placeholderTextColor={colors.onSurfaceSecondary} style={[styles.input, { minHeight: 60 }]} multiline />
              </Field>
            </Section>

            <Section title="CONTACTO DE EMERGENCIA">
              <Field label="Nombre del contacto">
                <TextInput testID="input-contacto-nombre" value={profile.contacto_nombre} onChangeText={(v) => setProfile({ ...profile, contacto_nombre: v })} placeholder="Ej. María Pérez" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
              </Field>
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={{ flex: 3 }}>
                  <Field label="Teléfono">
                    <TextInput testID="input-contacto-tel" value={profile.contacto_telefono} onChangeText={(v) => setProfile({ ...profile, contacto_telefono: v })} keyboardType="phone-pad" placeholder="+52 664..." placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
                  </Field>
                </View>
                <View style={{ flex: 2 }}>
                  <Field label="Relación">
                    <TextInput testID="input-contacto-rel" value={profile.contacto_relacion} onChangeText={(v) => setProfile({ ...profile, contacto_relacion: v })} placeholder="Hija" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
                  </Field>
                </View>
              </View>
            </Section>

            <Section title="OTROS">
              <Field label="Dirección de residencia">
                <TextInput testID="input-direccion" value={profile.direccion} onChangeText={(v) => setProfile({ ...profile, direccion: v })} placeholder="Calle, número, colonia" placeholderTextColor={colors.onSurfaceSecondary} style={styles.input} />
              </Field>
              <Field label="Notas adicionales">
                <TextInput testID="input-notas" value={profile.notas} onChangeText={(v) => setProfile({ ...profile, notas: v })} placeholder="Cualquier otro dato relevante" placeholderTextColor={colors.onSurfaceSecondary} style={[styles.input, { minHeight: 80 }]} multiline />
              </Field>
            </Section>

            <Pressable testID="save-profile-btn" onPress={onSave} disabled={saving} style={({ pressed }) => [styles.saveBtn, saving && { opacity: 0.6 }, pressed && { opacity: 0.85 }]}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>GUARDAR PERFIL</Text>}
            </Pressable>

            <Text style={styles.privacyNote}>
              ⓘ Estos datos se usan ÚNICAMENTE para enriquecer el resumen IA enviado a tu app cuando ocurre una emergencia. No se comparten con terceros.
            </Text>
          </ScrollView>
        )}

        {toast ? <View style={styles.toast} testID="profile-toast"><Text style={styles.toastText}>{toast}</Text></View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({ options, selected, onChange, testIDPrefix }: { options: { key: string; label: string }[]; selected: string; onChange: (k: string) => void; testIDPrefix: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {options.map((o) => {
        const active = selected === o.key;
        return (
          <Pressable key={o.key} testID={`${testIDPrefix}-${o.key}`} onPress={() => onChange(o.key)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && { color: colors.brand }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function MultiChipRow({ options, selected, onToggle, testIDPrefix }: { options: string[]; selected: string[]; onToggle: (v: string) => void; testIDPrefix: string }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <Pressable key={o} testID={`${testIDPrefix}-${o}`} onPress={() => onToggle(o)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && { color: colors.brand }]}>{o.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: colors.onSurface, fontFamily: fontFamily.displayBold, fontSize: 20, letterSpacing: 1.5 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: colors.brand, fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 2, marginBottom: spacing.sm },
  sectionBody: { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  fieldLabel: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 14, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.sm, minHeight: 42 },
  chip: { flexShrink: 0, paddingHorizontal: spacing.md, height: 30, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: "center" },
  chipActive: { borderColor: colors.brand, backgroundColor: colors.brandSecondary },
  chipText: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.textBold, fontSize: 11, letterSpacing: 0.5 },
  saveBtn: { backgroundColor: colors.brand, paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: "center", marginTop: spacing.md },
  saveBtnText: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 14, letterSpacing: 1.5 },
  privacyNote: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 11, lineHeight: 16, marginTop: spacing.md, textAlign: "center" },
  toast: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.xl, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.success, borderRadius: radius.md, padding: spacing.md },
  toastText: { color: colors.success, fontFamily: fontFamily.textBold, fontSize: 13, textAlign: "center" },
});
