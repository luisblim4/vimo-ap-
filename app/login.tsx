import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { colors, spacing, radius, fontFamily } from "@/src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/selector");
    } catch (e: any) {
      setError(e?.message || "Error al iniciar sesión");
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
        <View style={styles.container} testID="login-screen">
          <View style={styles.brandWrap}>
            <Text style={styles.brandMark}>VIMO S3</Text>
            <Text style={styles.brandSub}>SECURITY OPS · COMMAND CENTER</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              testID="login-email-input"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="operator@vimo.io"
              placeholderTextColor={colors.onSurfaceSecondary}
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: spacing.lg }]}>PASSWORD</Text>
            <TextInput
              testID="login-password-input"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.onSurfaceSecondary}
              style={styles.input}
            />

            {error ? <Text style={styles.error} testID="login-error">{error}</Text> : null}

            <Pressable
              testID="login-submit-button"
              onPress={onSubmit}
              disabled={loading || !email || !password}
              style={({ pressed }) => [
                styles.btn,
                (loading || !email || !password) && { opacity: 0.5 },
                pressed && { opacity: 0.85 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>INICIAR SESIÓN</Text>
              )}
            </Pressable>

            <Link href="/register" asChild>
              <Pressable testID="goto-register" style={styles.linkRow}>
                <Text style={styles.linkText}>
                  ¿No tienes cuenta? <Text style={styles.linkAccent}>Regístrate</Text>
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
  brandMark: {
    fontFamily: fontFamily.displayBold,
    fontSize: 48,
    color: colors.onSurface,
    letterSpacing: 4,
  },
  brandSub: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: colors.onSurfaceSecondary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  form: {},
  label: {
    fontFamily: fontFamily.displayBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.onSurface,
    fontFamily: fontFamily.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  error: {
    fontFamily: fontFamily.text,
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.md,
  },
  btn: {
    backgroundColor: colors.brand,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  btnText: {
    color: "#fff",
    fontFamily: fontFamily.displayBold,
    fontSize: 15,
    letterSpacing: 1.5,
  },
  linkRow: { alignItems: "center", paddingVertical: spacing.lg },
  linkText: { color: colors.onSurfaceSecondary, fontFamily: fontFamily.text, fontSize: 13 },
  linkAccent: { color: colors.brand, fontFamily: fontFamily.textBold },
});
