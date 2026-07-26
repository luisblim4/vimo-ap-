import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily } from "@/src/theme";
import { DeviceProvider } from "@/src/context/DeviceContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <DeviceProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.onSurfaceSecondary,
          tabBarStyle: {
            backgroundColor: "#0A1128",
            borderTopColor: "#1E293B",
            borderTopWidth: 1,
            height: 60 + bottomInset,
            paddingTop: 8,
            paddingBottom: bottomInset,
          },
          tabBarLabelStyle: { fontFamily: fontFamily.displayBold, fontSize: 10, letterSpacing: 1 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "MONITOREO",
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="controls"
          options={{
            title: "CONTROL",
            tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="historial"
          options={{
            title: "HISTORIAL",
            tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "PERFIL",
            tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{ href: null }}
        />
      </Tabs>
    </DeviceProvider>
  );
}
