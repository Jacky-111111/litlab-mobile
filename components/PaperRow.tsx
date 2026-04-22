import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authorsLine, paperTitle } from "@/lib/format";
import { fontSize, fontWeight, spacing, useTheme } from "@/lib/theme";
import type { Paper } from "@/lib/types";

interface Props {
  paper: Paper;
  showDivider?: boolean;
}

export function PaperRow({ paper, showDivider = true }: Props) {
  const theme = useTheme();
  const subtitle = authorsLine(paper.authors, paper.year);

  return (
    <Link href={`/paper/${paper.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paperTitle(paper)}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed ? theme.primarySoft : "transparent",
            borderBottomColor: showDivider ? theme.border : "transparent",
          },
        ]}
      >
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={2}
        >
          {paperTitle(paper)}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: theme.muted }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
        {paper.source ? (
          <Text style={[styles.source, { color: theme.muted }]}>
            {paper.source.toUpperCase()}
          </Text>
        ) : null}
        <View style={styles.stretch} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: fontSize.caption,
    lineHeight: 18,
  },
  source: {
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  stretch: {
    width: "100%",
  },
});
