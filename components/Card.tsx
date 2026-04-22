import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { radius, spacing, useTheme } from "@/lib/theme";

interface Props {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

/** Primary content container matching the web app's card token. */
export function Card({ children, padding = spacing.lg, style }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          ...theme.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
  },
});
