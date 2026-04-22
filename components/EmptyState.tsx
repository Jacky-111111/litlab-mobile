import { SymbolView, SymbolViewProps } from "expo-symbols";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { fontSize, fontWeight, spacing, useTheme } from "@/lib/theme";

interface Props {
  symbol: SymbolViewProps["name"];
  title: string;
  message?: string;
}

export function EmptyState({ symbol, title, message }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <SymbolView
        name={symbol}
        size={40}
        tintColor={theme.muted}
        resizeMode="scaleAspectFit"
        style={styles.icon}
        fallback={<View style={styles.icon} />}
      />
      <Text
        style={[
          styles.title,
          { color: theme.text },
        ]}
      >
        {title}
      </Text>
      {message ? (
        <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    width: 44,
    height: 44,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.cardTitle,
    fontWeight: fontWeight.bold,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
});
