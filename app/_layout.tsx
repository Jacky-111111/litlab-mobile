import { Stack, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/lib/auth";
import { parseShareSlugFromUrl } from "@/lib/shareUrls";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may already be hidden; ignore.
});

function ShareLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const openShareIfPresent = (url: string | null) => {
      if (!url) return;
      const slug = parseShareSlugFromUrl(url);
      if (!slug) return;
      router.push({ pathname: "/shared/c/[slug]", params: { slug } });
    };

    const sub = Linking.addEventListener("url", (event) => {
      openShareIfPresent(event.url);
    });

    void Linking.getInitialURL().then(openShareIfPresent);

    return () => sub.remove();
  }, [router]);

  return null;
}

function AuthGate() {
  const { isReady, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === "login";
    const inPublicShare = segments[0] === "shared";
    if (!isSignedIn && !inAuthGroup && !inPublicShare) {
      router.replace("/login");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)/library");
    }
  }, [isReady, isSignedIn, segments, router]);

  return (
    <>
      <ShareLinkHandler />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <AuthGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
