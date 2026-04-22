import * as WebBrowser from "expo-web-browser";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { paperTitle } from "@/lib/format";
import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";
import type { Paper } from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

interface PaperDetailEnvelope {
  paper: Paper;
  note?: { paper_id: string; content: string; updated_at: string | null } | null;
  collection_ids?: string[];
}

export default function PaperDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? "");
  const theme = useTheme();

  const { state, reload } = useAsyncResource<PaperDetailEnvelope>(
    () => api.get<PaperDetailEnvelope>(`/papers/${id}`),
    [id]
  );

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const headerTitle =
    state.status === "loaded" ? paperTitle(state.value.paper) : "Paper";

  return (
    <ScreenBackground>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        {state.status === "loading" ? <LoadingView /> : null}
        {state.status === "failed" ? (
          <ErrorBanner message={state.message} onRetry={reload} />
        ) : null}
        {state.status === "loaded" ? (
          <PaperBody paper={state.value.paper} />
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

function PaperBody({ paper }: { paper: Paper }) {
  const theme = useTheme();
  const url = paper.url?.trim();
  const hasExternalLink = !!url && /^https?:\/\//i.test(url);

  const openSource = () => {
    if (!hasExternalLink) return;
    WebBrowser.openBrowserAsync(url).catch(() => undefined);
  };

  return (
    <View style={styles.stack}>
      <Card>
        <Text style={[styles.title, { color: theme.text }]}>
          {paperTitle(paper)}
        </Text>
        {paper.nickname && paper.nickname.trim() && paper.nickname !== paper.title ? (
          <Text style={[styles.formalTitle, { color: theme.muted }]}>
            {paper.title}
          </Text>
        ) : null}
        {paper.authors.length > 0 ? (
          <Text style={[styles.authors, { color: theme.text }]}>
            {paper.authors.join(", ")}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {paper.year ? (
            <MetaItem label="Year" value={String(paper.year)} />
          ) : null}
          {paper.source ? (
            <MetaItem label="Source" value={paper.source.toUpperCase()} />
          ) : null}
        </View>
      </Card>

      {paper.abstract?.trim() ? (
        <Card>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>
            Abstract
          </Text>
          <Text style={[styles.abstract, { color: theme.text }]}>
            {paper.abstract}
          </Text>
        </Card>
      ) : null}

      {paper.citation_apa?.trim() ? (
        <Card>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>
            Cite (APA)
          </Text>
          <View
            style={[
              styles.citationBox,
              {
                backgroundColor: theme.surfaceSoft,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[styles.citation, { color: theme.text }]}
              selectable
            >
              {paper.citation_apa}
            </Text>
          </View>
        </Card>
      ) : null}

      {hasExternalLink ? (
        <Button
          title="View source"
          variant="secondary"
          onPress={openSource}
        />
      ) : null}
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  stack: {
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
  formalTitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.caption,
    fontStyle: "italic",
  },
  authors: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: fontWeight.semibold,
  },
  metaValue: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
  },
  sectionHeading: {
    fontSize: fontSize.cardTitle,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  abstract: {
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  citationBox: {
    borderRadius: radius.button,
    borderWidth: 1,
    padding: spacing.md,
  },
  citation: {
    fontFamily: "Menlo",
    fontSize: 13,
    lineHeight: 20,
  },
});
