import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { colors, spacing, radius, fontFamily } from "@/src/theme";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register(email.trim(), password);
      router.replace("/selector");
    } catch (e: any) {
      setError(e?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container} testID="register-screen">
          <View style={styles.brandWrap}>
            <Text style={styles.brandMark}>VIMO S3</Text>
            <Text style={styles.brandSub}>NUEVO OPERADOR</Text>
          </View>

          <View>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              testID="register-email-input"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="operator@vimo.io"
              placeholderTextColor={colors.onSurfaceSecondary}
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: spacing.lg }]}>PASSWORD (mín. 6)</Text>
            <TextInput
              testID="register-password-input"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.onSurfaceSecondary}
              style={styles.input}
            />

            {error ? <Text style={styles.error} testID="register-error">{error}</Text> : null}

            <Pressable
              testID="register-submit-button"
              onPress={onSubmit}
              disabled={loading || !email || password.length < 6}
              style={({ pressed }) => [
                styles.btn,
                (loading || !email || password.length < 6) && { opacity: 0.5 },
                pressed && { opacity: 0.85 },
              ]}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CREAR CUENTA</Text>}
            </Pressable>

            <Link href="/login" asChild>
              <Pressable testID="goto-login" style={styles.linkRow}>
                <Text style={styles.linkText}>
                  ¿Ya tienes cuenta? <Text style={styles.linkAccent}>Inicia sesión</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: "center" },
  brandWrap: { alignItems: "center", marginBottom: spacing["3xl"] },
  brandMark: { fontFamily: fontFamily.displayBold, fontSize: 48, color: colors.onSurface, letterSpacing: 4 },
  brandSub: { fontFamily: fontFamily.text, fontSize: 11, color: colors.onSurfaceSecondary, letterSpacing: 2, marginTop: spacing.xs },
  label: { fontFamily: fontFamily.displayBold, fontSize: 11, letterSpacing: 1.5, color: colors.onSurfaceSecondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
    color: colors.onSurface, fontFamily: fontFamily.text, fontSize: 15,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md,
  },
  error: { fontFamily: fontFamily.text, color: colors.error, fontSize: 13, marginTop: spacing.md },
  btn: { backgroundColor: colors.brand, paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: "center", marginTop: spacing.xl },
  btnText: { color: "#fff", fontFamily: fontFamily.displayBold, fontSize: 15, letterSpacing: 1.5 },
  linkRow: { alignItems: "center", paddingVertical: spacing.lg },
  linkText: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 13 },
  linkAccent: { color: colors.brand, fontFamily: fontFamily.textBold },
});
