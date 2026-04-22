import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { PaperRow } from "@/components/PaperRow";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { spacing, useTheme } from "@/lib/theme";
import type { PapersEnvelope } from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

export default function CollectionPapersScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const id = String(params.id ?? "");
  const title = typeof params.title === "string" ? params.title : "Collection";
  const theme = useTheme();

  const { state, reload } = useAsyncResource<PapersEnvelope>(
    () => api.get<PapersEnvelope>(`/collections/${id}/papers`),
    [id]
  );

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const content = (() => {
    if (state.status === "loading") return <LoadingView />;
    if (state.status === "failed") {
      return <ErrorBanner message={state.message} onRetry={reload} />;
    }
    const papers = state.value.papers;
    if (papers.length === 0) {
      return (
        <EmptyState
          symbol="tray"
          title="No papers in this collection yet"
          message="Add papers from the LitLab web app."
        />
      );
    }
    return (
      <Card style={styles.listCard} padding={0}>
        {papers.map((p, i) => (
          <PaperRow
            key={p.id}
            paper={p}
            showDivider={i < papers.length - 1}
          />
        ))}
      </Card>
    );
  })();

  return (
    <ScreenBackground>
      <Stack.Screen
        options={{
          title,
          headerShown: true,
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { color: theme.text },
        }}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <View>{content}</View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
  },
  listCard: {
    overflow: "hidden",
  },
});
