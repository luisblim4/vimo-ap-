export const colors = {
  surface: "#0A1128",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#101B3B",
  onSurfaceSecondary: "#94A3B8",
  surfaceTertiary: "#1E293B",
  onSurfaceTertiary: "#CBD5E1",
  brand: "#00E5FF",
  brandSecondary: "#003C50",
  onBrandSecondary: "#80F3FF",
  success: "#00FF00",
  warning: "#F59E0B",
  error: "#EF4444",
  border: "#1E293B",
  borderStrong: "#334155",
  divider: "#1E293B",
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
  RECORDING: { bg: "#00E5FF22", fg: "#00E5FF", border: "#00E5FF" },
  PROCESSING: { bg: "#7C2D1233", fg: "#FCD34D", border: colors.warning },
  SPEAKING: { bg: "#00FF0022", fg: "#00FF00", border: colors.success },
  EMERGENCIA: { bg: "#7F1D1D55", fg: "#FCA5A5", border: colors.error },
};
