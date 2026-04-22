import { Redirect } from "expo-router";

import { LoadingView } from "@/components/LoadingView";
import { ScreenBackground } from "@/components/ScreenBackground";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { isReady, isSignedIn } = useAuth();

  if (!isReady) {
    return (
      <ScreenBackground>
        <LoadingView />
      </ScreenBackground>
    );
  }

  return (
    <Redirect href={isSignedIn ? "/(tabs)/library" : "/login"} />
  );
}
