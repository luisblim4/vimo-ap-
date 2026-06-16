export const colors = {
  surface: "#0C0D0F",
  onSurface: "#F2F3F5",
  surfaceSecondary: "#15171A",
  onSurfaceSecondary: "#A0A5B1",
  surfaceTertiary: "#22252A",
  onSurfaceTertiary: "#D1D5DB",
  brand: "#FF5E00",
  brandSecondary: "#331805",
  onBrandSecondary: "#FF8F4D",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  border: "#2C2F36",
  borderStrong: "#4B515D",
  divider: "#1E2024",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
};

export const fontFamily = {
  display: "BarlowCondensed_600SemiBold",
  displayBold: "BarlowCondensed_700Bold",
  text: "IBMPlexSans_400Regular",
  textBold: "IBMPlexSans_600SemiBold",
};

export const stateColors: Record<string, { bg: string; fg: string; border: string }> = {
  IDLE: { bg: colors.surfaceTertiary, fg: colors.onSurface, border: colors.border },
  RECORDING: { bg: "#1E3A8A33", fg: "#93C5FD", border: "#1E40AF" },
  PROCESSING: { bg: "#7C2D1233", fg: "#FCD34D", border: colors.warning },
  SPEAKING: { bg: "#0B3B2333", fg: "#86EFAC", border: colors.success },
  EMERGENCIA: { bg: "#7F1D1D55", fg: "#FCA5A5", border: colors.error },
};
