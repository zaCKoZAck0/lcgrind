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
import { getProgressSync } from "~/server/actions/progress/sync";

const HYDRATION_SESSION_KEY = "progress_hydrated";

function ProgressSyncHydrator() {
    useEffect(() => {
        if (sessionStorage.getItem(HYDRATION_SESSION_KEY)) return;

        getProgressSync()
            .then(({ enabled, data }) => {
                if (!enabled || !data || typeof data !== "object") return;

                sessionStorage.setItem(HYDRATION_SESSION_KEY, "1");

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
            .catch(() => {
                // Not logged in or network error — stay local silently
            });
    }, []);

    return null;
}

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

function setupSyncSubscriber() {
    store.subscribe(() => {
        if (!sessionStorage.getItem(HYDRATION_SESSION_KEY)) return;

        if (_saveTimer) clearTimeout(_saveTimer);
        _saveTimer = setTimeout(() => {
            getProgressSync()
                .then(({ enabled }) => {
                    if (!enabled) return;
                    return import("~/server/actions/progress/sync").then(
                        ({ saveProgress }) => {
                            const state = store.getState() as unknown as Record<string, unknown>;
                            return saveProgress(state);
                        },
                    );
                })
                .catch(() => {
                    // Silent — sync failure should never surface as an error to the user
                });
        }, 2000);
    });
}

setupSyncSubscriber();

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
