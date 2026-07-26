import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { useFonts as useBarlow, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from "@expo-google-fonts/barlow-condensed";
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold } from "@expo-google-fonts/ibm-plex-sans";
import { colors } from "@/src/theme";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "VIMO Alerts",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#EF4444",
  });
}

function NavGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "android") {
      // 🪄 Pintar la barra de navegación del sistema Android en Azul Marino VIMO
      NavigationBar.setBackgroundColorAsync("#0A1128").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const seg = segments[0] as string | undefined;
    const isAuthRoute = seg === "login" || seg === "register";
    if (!user && !isAuthRoute) {
      router.replace("/login");
    } else if (user && isAuthRoute) {
      router.replace("/selector");
    }
  }, [user, isLoading, segments, router]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data || {}) as any;
      const url = data.deeplink || data.action_url;
      if (!url) return;
      url.startsWith("http") ? Linking.openURL(url) : router.push(url);
    });
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = (response.notification.request.content.data || {}) as any;
      const url = data.deeplink || data.action_url;
      if (url) (url as string).startsWith("http") ? Linking.openURL(url) : router.push(url);
    });
    return () => { tapSub.remove(); };
  }, [router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A1128", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A1128" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="selector" />
      <Stack.Screen name="viviendas" />
      <Stack.Screen name="monitoreo-vivienda" />
      <Stack.Screen name="especificaciones-vivienda" />
      <Stack.Screen name="perfil-vivienda" />
      <Stack.Screen name="instituciones" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="alert/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="device/[id]/profile" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [iconsLoaded, iconsErr] = useIconFonts();
  const [fontsLoaded] = useBarlow({
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    IBMPlexSans_400Regular, IBMPlexSans_600SemiBold,
  });

  useEffect(() => {
    if ((iconsLoaded || iconsErr) && fontsLoaded) SplashScreen.hideAsync();
  }, [iconsLoaded, iconsErr, fontsLoaded]);

  if ((!iconsLoaded && !iconsErr) || !fontsLoaded) return null;

  return (
    <SafeAreaProvider style={{ backgroundColor: "#0A1128" }}>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0A1128" />
        <NavGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
