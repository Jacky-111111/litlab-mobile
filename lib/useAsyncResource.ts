import { useCallback, useEffect, useState } from "react";

import { APIError } from "./api";
import { useAuth } from "./auth";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "loaded"; value: T }
  | { status: "failed"; message: string };

export interface AsyncResource<T> {
  state: AsyncState<T>;
  reload: () => Promise<void>;
}

/**
 * Small wrapper that runs `fetcher` on mount + when `deps` change.
 * On HTTP 401 the user is signed out automatically by the API layer,
 * which will flip the auth state and navigate to /login via the gate.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = []
): AsyncResource<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const { signOut } = useAuth();

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const value = await fetcher();
      setState({ status: "loaded", value });
    } catch (err) {
      if (err instanceof APIError && err.notAuthenticated) {
        await signOut().catch(() => undefined);
        return;
      }
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setState({ status: "failed", message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { state, reload: load };
}
