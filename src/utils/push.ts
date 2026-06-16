import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "../api/client";

export async function registerForPushAsync(): Promise<void> {
  if (Platform.OS === "web") return;
  if (!Device.isDevice) return;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      final = req.status;
    }
    if (final !== "granted") return;

    const tokenResp = await Notifications.getDevicePushTokenAsync();
    await api.registerPush(Platform.OS as "android" | "ios", tokenResp.data);
  } catch (e) {
    // Push is best-effort; ignore failures (e.g. Expo Go)
    console.warn("Push registration failed", e);
  }
}
