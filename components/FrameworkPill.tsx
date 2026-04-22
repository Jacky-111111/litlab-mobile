import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";

interface Props {
  label: string;
  style?: ViewStyle;
}

export function FrameworkPill({ label, style }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: theme.primarySoft,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: theme.primary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
});
