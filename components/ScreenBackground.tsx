import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { useTheme } from "@/lib/theme";

/** App-wide background using the bg token. */
export function ScreenBackground({ style, children, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[styles.root, { backgroundColor: theme.bg }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
