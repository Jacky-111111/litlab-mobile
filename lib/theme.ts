import { useColorScheme } from "react-native";

/**
 * LitLab design tokens. Values lifted verbatim from
 * IOS_APP_SPEC.md §10 (which mirrors frontend/styles.css on the web app).
 *
 * NEVER invent new colors, radii, or shadows. If something isn't covered
 * here, pick the closest token.
 */

export type ColorScheme = "light" | "dark";

interface Palette {
  bg: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  muted: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  danger: string;
  border: string;
  infoBg: string;
  infoText: string;
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  errorBg: string;
  errorText: string;
}

const light: Palette = {
  bg: "#F6F8FC",
  surface: "#FFFFFF",
  surfaceSoft: "#FBFCFF",
  text: "#131722",
  muted: "#5D6579",
  primary: "#2158D9",
  primaryPressed: "#1C4CC0",
  primarySoft: "#E7EFFF",
  onPrimary: "#FFFFFF",
  danger: "#C8354E",
  border: "#DDE4F2",
  infoBg: "#EDF2FF",
  infoText: "#2C4376",
  successBg: "#E8F9EF",
  successText: "#1E6D41",
  warningBg: "#FFF5DB",
  warningText: "#885B00",
  errorBg: "#FFE9EE",
  errorText: "#9F1F39",
};

const dark: Palette = {
  bg: "#0F1420",
  surface: "#161D2B",
  surfaceSoft: "#1B2435",
  text: "#E8EDF7",
  muted: "#A7B2C9",
  primary: "#5C8FFF",
  primaryPressed: "#4677E6",
  primarySoft: "#22365F",
  onPrimary: "#FFFFFF",
  danger: "#E0536D",
  border: "#2A3550",
  infoBg: "#1F2E53",
  infoText: "#C9D9FF",
  successBg: "#17362A",
  successText: "#A9F0CD",
  warningBg: "#4A3512",
  warningText: "#FFE4A4",
  errorBg: "#4D1F29",
  errorText: "#FFC4CF",
};

/** 4-pt grid. Approved values only. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  row: 12,
  card: 14,
  button: 10,
  input: 10,
  segmented: 12,
  pill: 999,
} as const;

export const fontSize = {
  brand: 22,
  screenTitle: 28,
  inlineTitle: 20,
  cardTitle: 17,
  body: 15,
  button: 15,
  caption: 13,
} as const;

/** Inter font weights mapped to React Native font weights. */
export const fontWeight = {
  regular: "400",
  semibold: "600",
  bold: "700",
  extraBold: "800",
} as const satisfies Record<string, "400" | "600" | "700" | "800">;

export const palette = { light, dark };

export function useTheme(): Palette & {
  scheme: ColorScheme;
  shadow: {
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  };
} {
  const scheme: ColorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const p = scheme === "dark" ? dark : light;
  // Soft shadow on light mode only; dark mode relies on the border hairline.
  const shadow =
    scheme === "dark"
      ? {
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: 0,
        }
      : {
          shadowColor: "#141E3C",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        };
  return { ...p, scheme, shadow };
}
