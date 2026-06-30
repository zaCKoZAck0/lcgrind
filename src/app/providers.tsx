"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { REHYDRATE } from "redux-persist";
import { store, persistor } from "~/store";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { useState, useEffect } from "react";
import { getProgressSync, saveProgress } from "~/server/actions/progress/sync";

const SESSION_HYDRATED_KEY = "progress_hydrated";

// Cached after ProgressSyncHydrator fetches from server. Avoids a round-trip
// per Redux action in the subscriber below.
let _syncEnabledCache = false;
let _saveTimer: ReturnType<typeof setTimeout> | null = null;

// Module-level subscriber — runs on both server (SSR) and client. The
// typeof-window guard prevents sessionStorage access from crashing SSR.
store.subscribe(() => {
    if (typeof window === "undefined") return;
    if (!_syncEnabledCache) return;
    if (!sessionStorage.getItem(SESSION_HYDRATED_KEY)) return;

    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
        const state = store.getState() as unknown as Record<string, unknown>;
        saveProgress(state).catch(() => {});
    }, 2000);
});

function ProgressSyncHydrator() {
    useEffect(() => {
        // Already hydrated this browser session — re-set cache and skip re-fetch.
        if (sessionStorage.getItem(SESSION_HYDRATED_KEY)) {
            _syncEnabledCache = true;
            return;
        }

        getProgressSync()
            .then(({ enabled, data }) => {
                _syncEnabledCache = enabled;
                if (!enabled || !data || typeof data !== "object") return;

                sessionStorage.setItem(SESSION_HYDRATED_KEY, "1");

                const serialized: Record<string, string> = {};
                for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
                    serialized[k] = JSON.stringify(v);
                }
                serialized["_persist"] = JSON.stringify({ version: -1, rehydrated: true });
                localStorage.setItem("persist:leetcode-tracker", JSON.stringify(serialized));

                store.dispatch({
                    type: REHYDRATE,
                    key: "leetcode-tracker",
                    payload: data,
                });
            })
            .catch(() => {});
    }, []);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <Provider store={store}>
            <Analytics />
            <SpeedInsights />
            <TooltipProvider>
                <QueryClientProvider client={queryClient}>
                    <PersistGate
                        loading={
                            <div className="flex min-h-screen flex-col bg-background text-foreground" aria-busy="true">
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-pulse text-muted-foreground">Loading...</div>
                                </div>
                            </div>
                        }
                        persistor={persistor}
                    >
                        <ProgressSyncHydrator />
                        {children}
                        <Toaster />
                    </PersistGate>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </TooltipProvider>
        </Provider>
    );
}
