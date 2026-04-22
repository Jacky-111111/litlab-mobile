import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authorsLine, paperTitle } from "@/lib/format";
import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";
import type { Paper } from "@/lib/types";

export type PaperRowLayout = "inset" | "standalone";

interface Props {
  paper: Paper;
  showDivider?: boolean;
  /** inset: single card list with hairlines. standalone: spaced card cell with badge + chevron. */
  layout?: PaperRowLayout;
}

export function PaperRow({
  paper,
  showDivider = true,
  layout = "inset",
}: Props) {
  const theme = useTheme();
  const subtitle = authorsLine(paper.authors, paper.year);
  const isStandalone = layout === "standalone";

  const textStack = (
    <View style={isStandalone ? styles.textBlock : styles.insetTextStack}>
      <Text
        style={[
          styles.title,
          isStandalone && styles.titleStandalone,
          { color: theme.text },
        ]}
        numberOfLines={isStandalone ? 3 : 2}
      >
        {paperTitle(paper)}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            isStandalone && styles.subtitleStandalone,
            { color: theme.muted },
          ]}
          numberOfLines={isStandalone ? 2 : 1}
        >
          {subtitle}
        </Text>
      ) : null}
      {paper.source ? (
        isStandalone ? (
          <View
            style={[
              styles.sourcePill,
              {
                backgroundColor: theme.primarySoft,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.sourceLabel, { color: theme.muted }]}>
              {paper.source.toUpperCase()}
            </Text>
          </View>
        ) : (
          <Text style={[styles.sourceInset, { color: theme.muted }]}>
            {paper.source.toUpperCase()}
          </Text>
        )
      ) : null}
    </View>
  );

  return (
    <Link href={`/paper/${paper.id}`} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paperTitle(paper)}
        style={({ pressed }) => [
          isStandalone ? styles.rowStandalone : styles.rowInset,
          {
            backgroundColor: pressed ? theme.primarySoft : "transparent",
            borderBottomColor:
              !isStandalone && showDivider ? theme.border : "transparent",
          },
        ]}
      >
        {isStandalone ? (
          <View style={styles.standaloneInner}>
            {textStack}
            <View style={styles.chevronLane}>
              <Text style={[styles.chevronStandalone, { color: theme.muted }]}>
                ›
              </Text>
            </View>
          </View>
        ) : (
          textStack
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  rowInset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  rowStandalone: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  standaloneInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    paddingEnd: spacing.xs,
    gap: spacing.lg,
  },
  insetTextStack: {
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
  titleStandalone: {
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: fontSize.caption,
    lineHeight: 20,
  },
  subtitleStandalone: {
    lineHeight: 18,
  },
  sourcePill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sourceInset: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
  },
  sourceLabel: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.4,
  },
  chevron: {
    fontSize: 26,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
  },
  chevronLane: {
    width: 28,
    alignItems: "center",
  },
  chevronStandalone: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
});
