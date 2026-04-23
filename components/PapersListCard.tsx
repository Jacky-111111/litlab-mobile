import React from "react";
import { StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { PaperRow } from "@/components/PaperRow";
import { spacing } from "@/lib/theme";
import type { Paper } from "@/lib/types";

/** Library “All” and collection paper lists: one card per paper, same as `PaperRow` standalone layout. */
export function PapersListCard({ papers }: { papers: Paper[] }) {
  return (
    <View style={styles.stack}>
      {papers.map((p) => (
        <Card key={p.id} style={styles.cardShell} padding={spacing.xxl}>
          <PaperRow paper={p} layout="standalone" />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  cardShell: {
    overflow: "hidden",
  },
});
