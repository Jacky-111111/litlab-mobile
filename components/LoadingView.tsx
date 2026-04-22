import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useTheme } from "@/lib/theme";

interface Props {
  /** Delay in ms before the spinner appears to avoid flashes. Defaults to 200. */
  delayMs?: number;
}

export function LoadingView({ delayMs = 200 }: Props) {
  const theme = useTheme();
  const [visible, setVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  if (!visible) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
});
