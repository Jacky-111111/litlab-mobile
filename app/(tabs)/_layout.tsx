import { Tabs } from "expo-router";
import { SymbolView, SymbolViewProps } from "expo-symbols";
import React from "react";
import { Platform } from "react-native";

import { useAuth } from "@/lib/auth";
import { fontWeight, useTheme } from "@/lib/theme";

type TabIconProps = { color: string; focused: boolean };

function makeIcon(name: SymbolViewProps["name"]) {
  return function Icon({ color }: TabIconProps) {
    return (
      <SymbolView
        name={name}
        size={26}
        tintColor={color}
        resizeMode="scaleAspectFit"
        fallback={<></>}
      />
    );
  };
}

export default function TabsLayout() {
  const theme = useTheme();
  const { isSignedIn, isReady } = useAuth();

  // Fast-path: render nothing until auth hydrated; parent _layout redirects to
  // /login if not signed in.
  if (!isReady || !isSignedIn) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: {
          fontWeight: fontWeight.semibold,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          ...(Platform.OS === "ios" ? {} : { elevation: 0 }),
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: makeIcon("books.vertical"),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: makeIcon("folder"),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "My Account",
          tabBarIcon: makeIcon("person.crop.circle"),
        }}
      />
    </Tabs>
  );
}
