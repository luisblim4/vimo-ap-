import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily } from "@/src/theme";
import { DeviceProvider } from "@/src/context/DeviceContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <DeviceProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.onSurfaceSecondary,
          tabBarStyle: {
            backgroundColor: colors.surfaceSecondary,
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            height: 64 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
            paddingTop: 6,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          },
          tabBarLabelStyle: { fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "MAPA", tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="alerts"
          options={{ title: "ALERTAS", tabBarIcon: ({ color, size }) => <Ionicons name="warning-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="controls"
          options={{ title: "CONTROLES", tabBarIcon: ({ color, size }) => <Ionicons name="game-controller-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "PERFIL", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} /> }}
        />
        {/* legacy events tab — hidden from tab bar */}
        <Tabs.Screen name="events" options={{ href: null }} />
      </Tabs>
    </DeviceProvider>
  );
}
