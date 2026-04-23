import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

import { LoadingView } from "@/components/LoadingView";
import { ScreenBackground } from "@/components/ScreenBackground";
import { useAuth } from "@/lib/auth";
import { parseShareSlugFromUrl } from "@/lib/shareUrls";

export default function Index() {
  const { isReady, isSignedIn } = useAuth();
  const [bootState, setBootState] = useState<"pending" | "share" | "default">(
    "pending"
  );
  const [shareSlug, setShareSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    let alive = true;
    void Linking.getInitialURL().then((url) => {
      if (!alive) return;
      const slug = url ? parseShareSlugFromUrl(url) : null;
      if (slug) {
        setShareSlug(slug);
        setBootState("share");
      } else {
        setBootState("default");
      }
    });
    return () => {
      alive = false;
    };
  }, [isReady]);

  if (!isReady) {
    return (
      <ScreenBackground>
        <LoadingView />
      </ScreenBackground>
    );
  }

  if (bootState === "pending") {
    return (
      <ScreenBackground>
        <LoadingView />
      </ScreenBackground>
    );
  }

  if (bootState === "share" && shareSlug) {
    return (
      <Redirect
        href={{ pathname: "/shared/c/[slug]", params: { slug: shareSlug } }}
      />
    );
  }

  return (
    <Redirect href={isSignedIn ? "/(tabs)/library" : "/login"} />
  );
}
