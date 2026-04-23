import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { PaperRow } from "@/components/PaperRow";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { fontSize, fontWeight, spacing, useTheme } from "@/lib/theme";
import type { SharedCollectionResponse } from "@/lib/types";
import {
  isSharedCollectionGranted,
  sharedCollectionDeniedReason,
} from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

export default function SharedCollectionScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = String(params.slug ?? "");
  const theme = useTheme();
  const router = useRouter();

  const { state, reload } = useAsyncResource<SharedCollectionResponse>(
    () => api.getOptionalAuth<SharedCollectionResponse>(`/shared/c/${slug}`),
    [slug]
  );

  const content = (() => {
    if (state.status === "loading") return <LoadingView />;
    if (state.status === "failed") {
      return <ErrorBanner message={state.message} onRetry={reload} />;
    }
    const data = state.value;
    if (!isSharedCollectionGranted(data)) {
      const reason = sharedCollectionDeniedReason(data);
      const signIn = reason === "sign_in_required";
      return (
        <Card>
          <Text style={[styles.deniedTitle, { color: theme.text }]}>
            {signIn ? "Sign in required" : "Can't open this collection"}
          </Text>
          <Text style={[styles.deniedBody, { color: theme.muted }]}>
            {signIn
              ? "This shared collection only allows invited viewers. Sign in with your LitLab account."
              : reason === "private"
                ? "This collection is private."
                : reason === "not_authorized"
                  ? "Your account isn't on the invite list for this collection."
                  : `Unable to open this link (${reason}).`}
          </Text>
          {signIn ? (
            <Button
              title="Sign in"
              onPress={() => router.push("/login")}
              style={styles.deniedButton}
            />
          ) : null}
        </Card>
      );
    }

    const { collection, papers, sharer } = data;
    const header =
      sharer?.nickname || sharer?.email
        ? `Shared by ${sharer.nickname || sharer.email}`
        : null;

    if (papers.length === 0) {
      return (
        <>
          <Card style={styles.metaCard}>
            <Text style={[styles.collectionTitle, { color: theme.text }]}>
              {collection.title}
            </Text>
            {header ? (
              <Text style={[styles.sharer, { color: theme.muted }]}>
                {header}
              </Text>
            ) : null}
          </Card>
          <EmptyState
            symbol="tray"
            title="No papers in this collection"
            message="The owner has not added any papers yet."
          />
        </>
      );
    }

    return (
      <>
        <Card style={styles.metaCard}>
          <Text style={[styles.collectionTitle, { color: theme.text }]}>
            {collection.title}
          </Text>
          {header ? (
            <Text style={[styles.sharer, { color: theme.muted }]}>
              {header}
            </Text>
          ) : null}
        </Card>
        <Card style={styles.listCard} padding={0}>
          {papers.map((p, i) => (
            <PaperRow
              key={p.id}
              paper={p}
              showDivider={i < papers.length - 1}
            />
          ))}
        </Card>
      </>
    );
  })();

  return (
    <ScreenBackground>
      <Stack.Screen
        options={{
          title: "Shared collection",
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
          <RefreshControl refreshing={false} onRefresh={reload} />
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
  metaCard: {
    gap: spacing.sm,
  },
  collectionTitle: {
    fontSize: fontSize.inlineTitle,
    fontWeight: fontWeight.bold,
  },
  sharer: {
    fontSize: fontSize.caption,
  },
  listCard: {
    overflow: "hidden",
  },
  deniedTitle: {
    fontSize: fontSize.cardTitle,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  deniedBody: {
    fontSize: fontSize.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  deniedButton: {
    alignSelf: "flex-start",
  },
});
