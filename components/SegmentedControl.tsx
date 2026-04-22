import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";

export interface Segment<V extends string> {
  value: V;
  label: string;
}

interface Props<V extends string> {
  segments: Segment<V>[];
  value: V;
  onChange: (value: V) => void;
}

export function SegmentedControl<V extends string>({
  segments,
  value,
  onChange,
}: Props<V>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceSoft,
          borderColor: theme.border,
        },
      ]}
    >
      {segments.map((seg) => {
        const selected = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.item,
              selected && {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? theme.onPrimary : theme.text,
                },
              ]}
              numberOfLines={1}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.segmented,
    borderWidth: 1,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    minHeight: 36,
  },
  label: {
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
  },
});
