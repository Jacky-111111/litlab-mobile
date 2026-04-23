import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { PapersListCard } from "@/components/PapersListCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { fontWeight, spacing, useTheme } from "@/lib/theme";
import type { PapersEnvelope } from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

function CollectionShareHeaderButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Share collection"
      onPress={() =>
        router.push({
          pathname: "/collection/[id]/share",
          params: { id, title },
        })
      }
      style={styles.headerShareHit}
    >
      <Text style={[styles.headerShareLabel, { color: theme.primary }]}>
        Share
      </Text>
    </Pressable>
  );
}

export default function CollectionPapersScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const id = String(params.id ?? "");
  const title = typeof params.title === "string" ? params.title : "Collection";
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    return <PapersListCard papers={papers} />;
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
          headerBackTitle: "Back",
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => router.back()}
              tintColor={theme.text}
              label="Back"
            />
          ),
          headerRight: () => (
            <CollectionShareHeaderButton id={id} title={title} />
          ),
        }}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: spacing.xl + insets.bottom },
        ]}
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
  headerShareHit: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerShareLabel: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
  },
});
