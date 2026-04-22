import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ScreenBackground } from "@/components/ScreenBackground";
import { useAuth } from "@/lib/auth";
import { AppConfig } from "@/lib/config";
import { fontSize, fontWeight, radius, spacing, useTheme } from "@/lib/theme";

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => undefined
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Try again.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openWebSignup = () => {
    WebBrowser.openBrowserAsync(AppConfig.webURL).catch(() => undefined);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.center}>
            <Card style={styles.card}>
              <Text
                style={[
                  styles.brand,
                  { color: theme.primary },
                ]}
                accessibilityRole="header"
              >
                LitLab
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Sign in to your LitLab account.
              </Text>

              {errorMessage ? (
                <ErrorBanner message={errorMessage} />
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="you@school.edu"
                  placeholderTextColor={theme.muted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceSoft,
                      borderColor: theme.border,
                    },
                  ]}
                  editable={!submitting}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  textContentType="password"
                  placeholder="••••••••"
                  placeholderTextColor={theme.muted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceSoft,
                      borderColor: theme.border,
                    },
                  ]}
                  editable={!submitting}
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                />
              </View>

              <Button
                title="Sign In"
                onPress={onSubmit}
                loading={submitting}
                style={styles.submit}
              />

              <Pressable
                accessibilityRole="link"
                onPress={openWebSignup}
                style={styles.footerLink}
              >
                <Text style={[styles.footerText, { color: theme.muted }]}>
                  Don&apos;t have an account?{" "}
                  <Text style={{ color: theme.primary }}>
                    Sign up on LitLab web.
                  </Text>
                </Text>
              </Pressable>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  card: {
    gap: spacing.lg,
  },
  brand: {
    fontSize: 28,
    fontWeight: fontWeight.extraBold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: -spacing.sm,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
  input: {
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.body,
  },
  submit: {
    marginTop: spacing.xs,
  },
  footerLink: {
    alignItems: "center",
    paddingTop: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.caption,
    textAlign: "center",
  },
});
