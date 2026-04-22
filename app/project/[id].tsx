import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FrameworkPill } from "@/components/FrameworkPill";
import { LoadingView } from "@/components/LoadingView";
import { PaperRow } from "@/components/PaperRow";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";
import type {
  FrameworkSection,
  PapersEnvelope,
  Project,
  ProjectDetailEnvelope,
} from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProjectSpaceScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const id = String(params.id ?? "");
  const fallbackTitle =
    typeof params.title === "string" ? params.title : "Project";
  const theme = useTheme();

  const detail = useAsyncResource<ProjectDetailEnvelope>(
    () => api.get<ProjectDetailEnvelope>(`/projects/${id}`),
    [id]
  );
  const papers = useAsyncResource<PapersEnvelope>(
    () => api.get<PapersEnvelope>(`/projects/${id}/papers`),
    [id]
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([detail.reload(), papers.reload()]);
  }, [detail, papers]);

  const loadedProject =
    detail.state.status === "loaded" ? detail.state.value.project : null;
  const headerTitle = loadedProject?.title || fallbackTitle;

  return (
    <ScreenBackground>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerShown: true,
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { color: theme.text },
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
        {detail.state.status === "loading" && papers.state.status === "loading" ? (
          <LoadingView />
        ) : (
          <>
            <HeaderCard state={detail.state} />
            <FrameworkGuidanceCard state={detail.state} />
            <PapersCard state={papers.state} />
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function HeaderCard({
  state,
}: {
  state: ReturnType<typeof useAsyncResource<ProjectDetailEnvelope>>["state"];
}) {
  const theme = useTheme();
  if (state.status === "loading") return <LoadingView />;
  if (state.status === "failed") {
    return <ErrorBanner message={state.message} />;
  }
  const project: Project = state.value.project;
  return (
    <Card>
      <Text style={[styles.projectTitle, { color: theme.text }]}>
        {project.title}
      </Text>
      <View style={styles.pillRow}>
        <FrameworkPill label={project.framework_type} />
      </View>
      {project.description ? (
        <Text style={[styles.body, { color: theme.text }]}>
          {project.description}
        </Text>
      ) : null}
      {project.goal ? (
        <View style={styles.goalBlock}>
          <Text style={[styles.goalLabel, { color: theme.muted }]}>
            GOAL
          </Text>
          <Text style={[styles.body, { color: theme.text }]}>
            {project.goal}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function FrameworkGuidanceCard({
  state,
}: {
  state: ReturnType<typeof useAsyncResource<ProjectDetailEnvelope>>["state"];
}) {
  const theme = useTheme();
  if (state.status !== "loaded") return null;
  const guidance = state.value.framework_guidance;

  return (
    <Card>
      <Text style={[styles.sectionHeading, { color: theme.text }]}>
        Framework Guidance
      </Text>
      {guidance.description ? (
        <Text style={[styles.body, { color: theme.muted }]}>
          {guidance.description}
        </Text>
      ) : null}
      <View style={styles.sectionList}>
        {guidance.sections.map((section) => (
          <GuidanceSection key={section.title} section={section} />
        ))}
      </View>
    </Card>
  );
}

function GuidanceSection({ section }: { section: FrameworkSection }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View
      style={[
        styles.disclosure,
        { borderColor: theme.border, backgroundColor: theme.surfaceSoft },
      ]}
    >
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={styles.disclosureHeader}
      >
        <Text
          style={[styles.disclosureTitle, { color: theme.text }]}
          numberOfLines={2}
        >
          {section.title}
        </Text>
        <Text style={[styles.chevron, { color: theme.muted }]}>
          {expanded ? "▾" : "▸"}
        </Text>
      </Pressable>
      {expanded ? (
        <View style={styles.disclosureBody}>
          {section.explanation ? (
            <Text style={[styles.body, { color: theme.muted }]}>
              {section.explanation}
            </Text>
          ) : null}
          {section.prompt ? (
            <View
              style={[
                styles.promptBox,
                {
                  backgroundColor: theme.infoBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.prompt,
                  { color: theme.infoText },
                ]}
              >
                {section.prompt}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function PapersCard({
  state,
}: {
  state: ReturnType<typeof useAsyncResource<PapersEnvelope>>["state"];
}) {
  const theme = useTheme();
  if (state.status === "loading") {
    return (
      <Card>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          Papers in this project
        </Text>
        <LoadingView />
      </Card>
    );
  }
  if (state.status === "failed") {
    return (
      <Card>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          Papers in this project
        </Text>
        <ErrorBanner message={state.message} />
      </Card>
    );
  }

  const papers = state.value.papers;
  return (
    <Card padding={0} style={styles.papersCard}>
      <View style={styles.papersHeader}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          Papers in this project
        </Text>
      </View>
      {papers.length === 0 ? (
        <EmptyState
          symbol="doc.text"
          title="No papers attached"
          message="Add papers to this project from LitLab web."
        />
      ) : (
        papers.map((p, i) => (
          <PaperRow
            key={p.id}
            paper={p}
            showDivider={i < papers.length - 1}
          />
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
  pillRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
  },
  body: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  goalBlock: {
    marginTop: spacing.lg,
    gap: 4,
  },
  goalLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: fontWeight.semibold,
  },
  sectionHeading: {
    fontSize: fontSize.cardTitle,
    fontWeight: fontWeight.bold,
  },
  sectionList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  disclosure: {
    borderRadius: radius.row,
    borderWidth: 1,
    overflow: "hidden",
  },
  disclosureHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  disclosureTitle: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
  },
  chevron: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
  },
  disclosureBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  promptBox: {
    borderRadius: radius.button,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  prompt: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  papersCard: {
    overflow: "hidden",
  },
  papersHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
