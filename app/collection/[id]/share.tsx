import { HeaderBackButton } from "@react-navigation/elements";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingView } from "@/components/LoadingView";
import { ScreenBackground } from "@/components/ScreenBackground";
import { SegmentedControl } from "@/components/SegmentedControl";
import { APIError, api } from "@/lib/api";
import { buildShareCollectionPageUrl, shareQrOrigin } from "@/lib/shareUrls";
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
} from "@/lib/theme";
import type { CollectionSharing } from "@/lib/types";
import { useAsyncResource } from "@/lib/useAsyncResource";

type Visibility = "private" | "selected" | "public";

async function fetchCollectionSharing(id: string): Promise<CollectionSharing> {
  const raw = await api.get<
    CollectionSharing | { sharing: CollectionSharing }
  >(`/collections/${id}/sharing`);
  if (raw && typeof raw === "object" && "sharing" in raw && raw.sharing) {
    return raw.sharing;
  }
  return raw as CollectionSharing;
}

function normalizeVisibility(v: string | null | undefined): Visibility {
  if (v === "selected" || v === "public" || v === "private") return v;
  return "private";
}

export default function CollectionShareScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const id = String(params.id ?? "");
  const theme = useTheme();
  const router = useRouter();

  const { state, reload } = useAsyncResource<CollectionSharing>(
    () => fetchCollectionSharing(id),
    [id]
  );

  const [visibilityDraft, setVisibilityDraft] = useState<Visibility>("private");
  const [emailsDraft, setEmailsDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [qrUri, setQrUri] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status !== "loaded") return;
    const s = state.value;
    setVisibilityDraft(normalizeVisibility(s.visibility));
    const emails = s.invited_emails ?? [];
    setEmailsDraft(emails.join("\n"));
  }, [state]);

  const shareSlug = state.status === "loaded" ? state.value.share_slug : null;

  const loadQr = useCallback(async () => {
    if (!shareSlug) {
      setQrUri(null);
      setQrError(null);
      return;
    }
    setQrLoading(true);
    setQrError(null);
    try {
      const uri = await api.fetchAuthedBlobDataUri(
        `/shared/c/${encodeURIComponent(shareSlug)}/qr.png`,
        { origin: shareQrOrigin, size: 512 }
      );
      setQrUri(uri);
    } catch (err) {
      const message =
        err instanceof APIError
          ? err.message
          : "Could not load QR code. You may need to be the collection owner.";
      setQrError(message);
      setQrUri(null);
    } finally {
      setQrLoading(false);
    }
  }, [shareSlug]);

  useEffect(() => {
    void loadQr();
  }, [loadQr]);

  const shareUrl = useMemo(
    () => (shareSlug ? buildShareCollectionPageUrl(shareSlug) : null),
    [shareSlug]
  );

  const onCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    await Clipboard.setStringAsync(shareUrl);
    setCopyFeedback("Copied to clipboard");
    setTimeout(() => setCopyFeedback(null), 2000);
  }, [shareUrl]);

  const onSave = useCallback(async () => {
    if (state.status !== "loaded") return;
    setSaving(true);
    try {
      const emails = emailsDraft
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      await api.patch(`/collections/${id}/sharing`, {
        visibility: visibilityDraft,
        invited_emails: emails,
      });
      await reload();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save sharing settings.";
      Alert.alert("Save failed", message);
    } finally {
      setSaving(false);
    }
  }, [state.status, emailsDraft, visibilityDraft, id, reload]);

  const onRegenerate = useCallback(() => {
    Alert.alert(
      "Regenerate share link?",
      "Old links and QR codes will stop working until you share the new ones.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setRegenerating(true);
              try {
                await api.post(`/collections/${id}/sharing/regenerate-link`);
                await reload();
              } catch (err) {
                const message =
                  err instanceof Error
                    ? err.message
                    : "Could not regenerate link.";
                Alert.alert("Regenerate failed", message);
              } finally {
                setRegenerating(false);
              }
            })();
          },
        },
      ]
    );
  }, [id, reload]);

  const loadedSharing = state.status === "loaded" ? state.value : null;
  const canRegenerate =
    loadedSharing !== null &&
    (normalizeVisibility(loadedSharing.visibility) === "selected" ||
      normalizeVisibility(loadedSharing.visibility) === "public");

  const body = (() => {
    if (state.status === "loading") return <LoadingView />;
    if (state.status === "failed") {
      return <ErrorBanner message={state.message} onRetry={reload} />;
    }

    return (
      <>
        <Card>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>
            Who can access
          </Text>
          <SegmentedControl<Visibility>
            segments={[
              { value: "private", label: "Private" },
              { value: "selected", label: "Invited" },
              { value: "public", label: "Public" },
            ]}
            value={visibilityDraft}
            onChange={setVisibilityDraft}
          />
          <Text style={[styles.hint, { color: theme.muted }]}>
            Private: only you. Invited: people you add by email. Public: anyone
            with the link.
          </Text>
        </Card>

        <Card>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>
            Invited emails
          </Text>
          <TextInput
            value={emailsDraft}
            onChangeText={setEmailsDraft}
            placeholder="one@school.edu, other@school.edu"
            placeholderTextColor={theme.muted}
            multiline
            style={[
              styles.textArea,
              {
                color: theme.text,
                borderColor: theme.border,
                backgroundColor: theme.surfaceSoft,
              },
            ]}
          />
          <Text style={[styles.hint, { color: theme.muted }]}>
            Used when visibility is Invited. Separate with commas or new lines.
          </Text>
        </Card>

        <Button title="Save changes" onPress={onSave} loading={saving} />

        <Card>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>
            Share link
          </Text>
          {!shareUrl ? (
            <Text style={[styles.hint, { color: theme.muted }]}>
              A link is created when you set visibility to Invited or Public and
              save.
            </Text>
          ) : (
            <>
              <Text
                style={[styles.linkText, { color: theme.primary }]}
                selectable
              >
                {shareUrl}
              </Text>
              <Button
                title="Copy link"
                variant="secondary"
                onPress={() => void onCopyLink()}
              />
              {copyFeedback ? (
                <Text style={[styles.copyFeedback, { color: theme.successText }]}>
                  {copyFeedback}
                </Text>
              ) : null}
            </>
          )}
        </Card>

        <Card>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>
            QR code
          </Text>
          {!shareSlug ? (
            <Text style={[styles.hint, { color: theme.muted }]}>
              Save sharing settings with a public link to generate a QR code.
            </Text>
          ) : qrLoading ? (
            <LoadingView />
          ) : qrError ? (
            <ErrorBanner message={qrError} onRetry={loadQr} />
          ) : qrUri ? (
            <Image
              source={{ uri: qrUri }}
              style={styles.qrImage}
              contentFit="contain"
            />
          ) : null}
        </Card>

        <Button
          title="Regenerate link & QR"
          variant="destructive"
          disabled={!canRegenerate}
          loading={regenerating}
          onPress={onRegenerate}
        />
        {!canRegenerate && state.status === "loaded" ? (
          <Text style={[styles.hint, { color: theme.muted }]}>
            Save Invited or Public visibility to enable regenerating the link.
          </Text>
        ) : null}
      </>
    );
  })();

  return (
    <ScreenBackground>
      <Stack.Screen
        options={{
          title: "Share collection",
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
        }}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={reload} />
        }
      >
        {body}
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
    paddingBottom: spacing.huge,
  },
  sectionLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  hint: {
    fontSize: fontSize.caption,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  textArea: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.md,
    fontSize: fontSize.body,
    textAlignVertical: "top",
  },
  linkText: {
    fontSize: fontSize.caption,
    marginBottom: spacing.md,
  },
  copyFeedback: {
    fontSize: fontSize.caption,
    marginTop: spacing.sm,
  },
  qrImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
});
