import React, { useCallback } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { ScreenBackground } from "@/components/ScreenBackground";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AppConfig } from "@/lib/config";
import { fontSize, fontWeight, spacing, useTheme } from "@/lib/theme";
import type { Profile, ProfileEnvelope } from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

export default function AccountScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();

  const { state, reload } = useAsyncResource<ProfileEnvelope>(
    () => api.get<ProfileEnvelope>("/account/profile"),
    []
  );

  const confirmSignOut = useCallback(() => {
    Alert.alert(
      "Sign out of LitLab?",
      "You'll need to sign in again to view your library.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            signOut().catch(() => undefined);
          },
        },
      ]
    );
  }, [signOut]);

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const body = (() => {
    if (state.status === "loading") return <LoadingView />;
    if (state.status === "failed") {
      return (
        <ErrorBanner
          message="Couldn't load your profile. Pull to retry."
          onRetry={reload}
        />
      );
    }
    return <ProfileCard profile={state.value.profile} />;
  })();

  const apiHost = (() => {
    try {
      return new URL(AppConfig.apiBaseURL).host;
    } catch {
      return AppConfig.apiBaseURL;
    }
  })();

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Account</Text>
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
        >
          {body}

          <Button
            title="Sign Out"
            variant="destructive"
            onPress={confirmSignOut}
            style={styles.signOut}
          />

          <Text style={[styles.footer, { color: theme.muted }]}>
            {AppConfig.appVersionLabel}
          </Text>
          <Text style={[styles.footerSmall, { color: theme.muted }]}>
            API: {apiHost}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const theme = useTheme();
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Username", value: profile.nickname?.trim() || "—" },
    { label: "User ID", value: profile.user_id, mono: true },
    { label: "Email", value: profile.email },
    { label: "School", value: profile.school?.trim() || "—" },
  ];

  return (
    <Card>
      {rows.map((row, idx) => (
        <View
          key={row.label}
          style={[
            styles.row,
            idx < rows.length - 1 && {
              borderBottomColor: theme.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Text style={[styles.rowLabel, { color: theme.muted }]}>
            {row.label}
          </Text>
          <Text
            style={[
              styles.rowValue,
              { color: theme.text },
              row.mono && styles.mono,
            ]}
            numberOfLines={row.mono ? 1 : 2}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </Card>
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
    gap: spacing.lg,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  rowValue: {
    flex: 2,
    fontSize: fontSize.body,
    textAlign: "right",
  },
  mono: {
    fontFamily: "Menlo",
    fontSize: 12,
  },
  signOut: {
    marginTop: spacing.md,
  },
  footer: {
    fontSize: fontSize.caption,
    textAlign: "center",
    marginTop: spacing.md,
  },
  footerSmall: {
    fontSize: 11,
    textAlign: "center",
  },
});
