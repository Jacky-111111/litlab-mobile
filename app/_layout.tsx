import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/lib/auth";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may already be hidden; ignore.
});

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
    if (!isSignedIn && !inAuthGroup) {
      router.replace("/login");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)/library");
    }
  }, [isReady, isSignedIn, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
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
