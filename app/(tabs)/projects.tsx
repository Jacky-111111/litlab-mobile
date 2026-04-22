import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FrameworkPill } from "@/components/FrameworkPill";
import { LoadingView } from "@/components/LoadingView";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { relativeFromISO } from "@/lib/format";
import { fontSize, fontWeight, spacing, useTheme } from "@/lib/theme";
import type { Project, ProjectsEnvelope } from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

export default function ProjectsScreen() {
  const theme = useTheme();
  const { state, reload } = useAsyncResource<ProjectsEnvelope>(
    () => api.get<ProjectsEnvelope>("/projects"),
    []
  );

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const content = (() => {
    if (state.status === "loading") return <LoadingView />;
    if (state.status === "failed") {
      return <ErrorBanner message={state.message} onRetry={reload} />;
    }
    const projects = state.value.projects;
    if (projects.length === 0) {
      return (
        <EmptyState
          symbol="folder.badge.questionmark"
          title="No projects yet"
          message="Create your first project from the LitLab web app."
        />
      );
    }
    return (
      <View style={styles.list}>
        {projects.map((p) => (
          <ProjectListCard key={p.id} project={p} />
        ))}
      </View>
    );
  })();

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Projects</Text>
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ProjectListCard({ project }: { project: Project }) {
  const router = useRouter();
  const theme = useTheme();
  const updated = relativeFromISO(project.updated_at);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/project/[id]",
          params: { id: project.id, title: project.title },
        })
      }
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <Card>
        <View style={styles.cardHeader}>
          <Text
            style={[styles.cardTitle, { color: theme.text }]}
            numberOfLines={2}
          >
            {project.title}
          </Text>
          {updated ? (
            <Text style={[styles.updated, { color: theme.muted }]}>
              Updated {updated}
            </Text>
          ) : null}
        </View>
        <View style={styles.pillRow}>
          <FrameworkPill label={project.framework_type} />
        </View>
        {project.description ? (
          <Text
            style={[styles.description, { color: theme.muted }]}
            numberOfLines={3}
          >
            {project.description}
          </Text>
        ) : null}
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
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.screenTitle,
    fontWeight: fontWeight.bold,
  },
  scroll: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
    flexGrow: 1,
  },
  list: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  cardTitle: {
    flex: 1,
    fontSize: fontSize.cardTitle,
    fontWeight: fontWeight.bold,
    lineHeight: 22,
  },
  updated: {
    fontSize: fontSize.caption,
  },
  pillRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
  },
  description: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
  },
});
