import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useAuth } from "@/src/context/AuthContext";
import { colors, spacing, radius, fontFamily } from "@/src/theme";

export default function Login() {
  const authContext = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (authContext?.login && typeof authContext.login === 'function') {
        await authContext.login(email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.replace("/selector");
    } catch (e: any) {
      console.log("Login error:", e);
      let msg = e?.message || "Error al iniciar sesión";
      if (e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
        msg = "Contraseña incorrecta. Por favor verifica tus datos.";
      } else if (e?.code === 'auth/user-not-found') {
        msg = "No existe una cuenta registrada con este correo.";
      } else if (e?.code === 'auth/invalid-email') {
        msg = "El formato de correo es inválido.";
      }
      setError(msg);
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

            <Text style={[styles.label, { marginTop: spacing.lg }]}>CONTRASEÑA</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                testID="login-password-input"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor={colors.onSurfaceSecondary}
                style={styles.passwordInput}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.onSurfaceSecondary} />
              </Pressable>
            </View>

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
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  passwordInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fontFamily.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
  },
  error: {
    fontFamily: fontFamily.text,
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.md,
    fontWeight: 'bold',
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
