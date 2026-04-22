import { Stack, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { PaperRow } from "@/components/PaperRow";
import { ScreenBackground } from "@/components/ScreenBackground";
import { SegmentedControl } from "@/components/SegmentedControl";
import { api } from "@/lib/api";
import { fontSize, fontWeight, spacing, useTheme } from "@/lib/theme";
import type {
  Collection,
  CollectionsEnvelope,
  Paper,
  PapersEnvelope,
} from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

type Tab = "all" | "collections";

const PAGE_SIZE = 50;

export default function LibraryScreen() {
  const [tab, setTab] = useState<Tab>("all");

  return (
    <ScreenBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, useTitleStyle()]}>Library</Text>
          <View style={styles.segmentWrap}>
            <SegmentedControl<Tab>
              segments={[
                { value: "all", label: "All" },
                { value: "collections", label: "Collections" },
              ]}
              value={tab}
              onChange={setTab}
            />
          </View>
        </View>

        {tab === "all" ? <AllPapersView /> : <CollectionsView />}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function useTitleStyle() {
  const theme = useTheme();
  return { color: theme.text };
}

function AllPapersView() {
  const insets = useSafeAreaInsets();
  const { state, reload } = useAsyncResource<PapersEnvelope>(
    () => api.get<PapersEnvelope>("/papers", { limit: PAGE_SIZE, offset: 0 }),
    []
  );

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const scrollContentStyle = [
    styles.scroll,
    { paddingBottom: spacing.xl + insets.bottom },
  ];

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "failed") {
    return (
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <ErrorBanner message={state.message} onRetry={reload} />
      </ScrollView>
    );
  }

  const papers = state.status === "loaded" ? state.value.papers : [];

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={scrollContentStyle}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      {papers.length === 0 ? (
        <EmptyState
          symbol="books.vertical"
          title="No papers yet"
          message="No papers in your library yet. Add some from the LitLab web app."
        />
      ) : (
        <PapersListCard papers={papers} />
      )}
    </ScrollView>
  );
}

function PapersListCard({ papers }: { papers: Paper[] }) {
  return (
    <View style={styles.papersStack}>
      {papers.map((p) => (
        <Card key={p.id} style={styles.paperCardShell} padding={spacing.xxl}>
          <PaperRow paper={p} layout="standalone" />
        </Card>
      ))}
    </View>
  );
}

function CollectionsView() {
  const insets = useSafeAreaInsets();
  const { state, reload } = useAsyncResource<CollectionsEnvelope>(
    () => api.get<CollectionsEnvelope>("/collections"),
    []
  );

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const scrollContentStyle = [
    styles.scroll,
    { paddingBottom: spacing.xl + insets.bottom },
  ];

  const collections = useMemo(
    () => (state.status === "loaded" ? state.value.collections : []),
    [state]
  );

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "failed") {
    return (
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <ErrorBanner message={state.message} onRetry={reload} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={scrollContentStyle}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      {collections.length === 0 ? (
        <EmptyState
          symbol="tray"
          title="No collections yet"
          message="No collections yet. Create collections from the LitLab web app."
        />
      ) : (
        <View style={styles.collectionList}>
          {collections.map((c) => (
            <CollectionRow key={c.id} collection={c} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function CollectionRow({ collection }: { collection: Collection }) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/collection/[id]",
          params: { id: collection.id, title: collection.title },
        })
      }
      style={({ pressed }) => [
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Card style={styles.collectionCard}>
        <View style={styles.collectionCardInner}>
          <View style={styles.collectionText}>
            <Text
              style={[styles.collectionTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {collection.title}
            </Text>
            {collection.description ? (
              <Text
                style={[styles.collectionDescription, { color: theme.muted }]}
                numberOfLines={2}
              >
                {collection.description}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.chevron, { color: theme.muted }]}>›</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.screenTitle,
    fontWeight: fontWeight.bold,
  },
  segmentWrap: {},
  scroll: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
    flexGrow: 1,
  },
  papersStack: {
    gap: spacing.lg,
  },
  paperCardShell: {
    overflow: "hidden",
  },
  collectionList: {
    gap: spacing.md,
  },
  collectionCard: {},
  collectionCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  collectionText: {
    flex: 1,
    gap: 2,
  },
  collectionTitle: {
    fontSize: fontSize.cardTitle,
    fontWeight: fontWeight.bold,
  },
  collectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 26,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
  },
});
