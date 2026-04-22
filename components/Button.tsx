import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";

type Variant = "primary" | "secondary" | "destructive";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle(variant, theme, pressed, !!isDisabled),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "destructive" ? theme.onPrimary : theme.primary}
        />
      ) : (
        <View style={styles.label}>
          <Text
            style={[
              styles.text,
              {
                color:
                  variant === "primary" || variant === "destructive"
                    ? theme.onPrimary
                    : theme.primary,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function variantStyle(
  variant: Variant,
  theme: ReturnType<typeof useTheme>,
  pressed: boolean,
  disabled: boolean
): ViewStyle {
  const opacity = disabled ? 0.55 : 1;
  switch (variant) {
    case "primary":
      return {
        backgroundColor: pressed ? theme.primaryPressed : theme.primary,
        opacity,
      };
    case "destructive":
      return {
        backgroundColor: pressed
          ? // Slightly darker when pressed; no explicit token on spec so we blend.
            blendDarken(theme.danger, 0.12)
          : theme.danger,
        opacity,
      };
    case "secondary":
      return {
        backgroundColor: pressed ? theme.primarySoft : "transparent",
        borderColor: theme.primary,
        borderWidth: 1,
        opacity,
      };
  }
}

/** Very rough darken helper for the destructive pressed state. */
function blendDarken(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const darken = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  const to = (c: number) => c.toString(16).padStart(2, "0");
  return `#${to(darken(r))}${to(darken(g))}${to(darken(b))}`;
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
  },
});
