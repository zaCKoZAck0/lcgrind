# Progress Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users opt-in to syncing their local Redux progress (completed problems, notes, sheet settings, custom lists) to the server, with a pencil shortcut from their profile banner.

**Architecture:** Redux-persist serializes all local state to `localStorage['persist:leetcode-tracker']`. Sync uploads that blob to a new `progressData Json?` column on User. On app load, a client component checks if sync is enabled and re-hydrates the Redux store from DB using redux-persist's REHYDRATE action. Subscribe debounce (2s) keeps DB in sync after the initial load. The toggle lives on the existing `/settings/profile` page (retitled "(Legacy)"); the pencil icon on the profile banner navigates there.

**Tech Stack:** Next.js 15 App Router, Prisma (PostgreSQL), Redux Toolkit + redux-persist, Lucide React icons, shadcn/ui Switch + Tooltip, better-auth server actions.

---

## File Map

| Action   | Path |
|----------|------|
| Modify   | `prisma/schema.prisma` |
| Create   | `src/server/actions/progress/sync.ts` |
| Modify   | `src/app/u/[handle]/page.tsx` |
| Create   | `src/components/settings/progress-sync-toggle.tsx` |
| Modify   | `src/app/settings/profile/page.tsx` |
| Modify   | `src/app/providers.tsx` |

---

## Task 1: Schema — sync fields on User

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add two fields to the User model**

In `prisma/schema.prisma`, inside the `model User { ... }` block (around line 356), add after `onboardedAt`:

```prisma
  syncProgress   Boolean  @default(false)
  progressData   Json?
```

The full User model additions look like:

```prisma
  // Null until the user completes the post-login profile setup popup.
  onboardedAt   DateTime?
  syncProgress  Boolean   @default(false)
  progressData  Json?
```

- [ ] **Step 2: Push schema to DB**

```bash
npx prisma db push
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Verify Prisma client regenerated**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: no errors about `syncProgress` or `progressData`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add syncProgress + progressData fields to User"
```

---

## Task 2: Server actions — progress sync API

**Files:**
- Create: `src/server/actions/progress/sync.ts`

- [ ] **Step 1: Create the file**

```ts
"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

export type ProgressSyncStatus = {
    enabled: boolean;
    data: unknown;
};

export type ProgressSyncResult = { ok: true } | { ok: false; error: string };

// Returns current sync preference + stored progress blob.
export async function getProgressSync(): Promise<ProgressSyncStatus> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { enabled: false, data: null };

    const user = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { syncProgress: true, progressData: true },
    });

    return { enabled: user.syncProgress, data: user.progressData };
}

// Toggles sync on/off. Does not touch progressData.
export async function setProgressSync(
    enabled: boolean,
): Promise<ProgressSyncResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Not authenticated" };

    await db.user.update({
        where: { id: session.user.id },
        data: { syncProgress: enabled },
    });

    return { ok: true };
}

// Saves the full redux-persist state blob to DB.
// Only accepts plain objects — strings or null are rejected.
export async function saveProgress(
    data: unknown,
): Promise<ProgressSyncResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Not authenticated" };

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return { ok: false, error: "Invalid progress data shape" };
    }

    await db.user.update({
        where: { id: session.user.id },
        data: { progressData: data as object },
    });

    return { ok: true };
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit 2>&1 | grep "progress/sync"
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/server/actions/progress/sync.ts
git commit -m "feat: server actions for progress sync (get/set/save)"
```

---

## Task 3: Pencil icon on profile banner

**Files:**
- Modify: `src/app/u/[handle]/page.tsx`

The goal: show a pencil button top-right of the banner only when the logged-in user is viewing their own profile. The page is already a server component, so we add a `headers()` + session call.

- [ ] **Step 1: Add imports**

At the top of `src/app/u/[handle]/page.tsx`, update the import block:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ChevronRight, ThumbsUp, Zap, Award, Pencil } from "lucide-react";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { getFeed } from "~/server/actions/grinds/feed";
import { getProfileByHandle } from "~/server/actions/grinds/profile";
import { PostCard } from "~/components/grinds/post-card";
import { BackLink } from "~/components/grinds/back-link";
import { ProfileBanner } from "~/components/grinds/profile-banner";
import { EmptyState } from "~/components/grinds/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { buttonVariants } from "~/components/ui/button";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
```

- [ ] **Step 2: Fetch session in the page component**

Inside `UserProfilePage`, before the `return`, add:

```tsx
const session = await auth.api.getSession({ headers: await headers() });
const isOwnProfile = session?.user.id === profile.id;
```

Full updated function signature section:

```tsx
export default async function UserProfilePage({
    params,
    searchParams,
}: {
    params: Promise<RawParams>;
    searchParams: Promise<RawSearch>;
}) {
    const { handle } = await params;
    const { cursor } = await searchParams;

    const profile = await getProfileByHandle(db, handle);
    if (!profile) notFound();

    const session = await auth.api.getSession({ headers: await headers() });
    const isOwnProfile = session?.user.id === profile.id;

    const feedPosts = FEATURE_FLAGS.GRINDS ? await getFeed(db, {
        sort: "new",
        authorId: profile.id,
        cursor,
    }) : { posts: [], nextCursor: null };
    const { posts, nextCursor } = feedPosts;
```

- [ ] **Step 3: Add pencil button overlay on the banner**

Replace the banner section inside the profile Card:

```tsx
{/* Banner */}
<div className="relative">
    <ProfileBanner />
    {isOwnProfile && (
        <Link
            href="/settings/profile"
            className={cn(
                buttonVariants({ variant: "neutral", size: "icon" }),
                "absolute top-2 right-2 size-8"
            )}
            aria-label="Edit profile"
        >
            <Pencil className="size-3.5" />
        </Link>
    )}
</div>
```

Make sure `cn` is imported — add it to imports:

```tsx
import { cn } from "~/lib/utils";
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "handle\]/page"
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/u/\[handle\]/page.tsx
git commit -m "feat: pencil icon on profile banner linking to settings"
```

---

## Task 4: ProgressSyncToggle component

**Files:**
- Create: `src/components/settings/progress-sync-toggle.tsx`

This client component reads the current sync state, shows a labeled switch with a tooltip, and handles enable/disable:
- **Enable**: reads `localStorage['persist:leetcode-tracker']` → parses → calls `saveProgress` → calls `setProgressSync(true)`
- **Disable**: calls `setProgressSync(false)`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState, useTransition } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import {
    setProgressSync,
    saveProgress,
} from "~/server/actions/progress/sync";

type Props = {
    initialEnabled: boolean;
};

export function ProgressSyncToggle({ initialEnabled }: Props) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isPending, startTransition] = useTransition();

    function handleToggle(next: boolean) {
        startTransition(async () => {
            if (next) {
                // Upload current local state before enabling
                const raw = localStorage.getItem("persist:leetcode-tracker");
                if (raw) {
                    // redux-persist stores each slice as a JSON string — parse the outer object,
                    // then parse each slice value so we save a proper nested object.
                    const outer = JSON.parse(raw) as Record<string, string>;
                    const parsed: Record<string, unknown> = {};
                    for (const [k, v] of Object.entries(outer)) {
                        if (k === "_persist") continue;
                        try { parsed[k] = JSON.parse(v); } catch { parsed[k] = v; }
                    }
                    const saveResult = await saveProgress(parsed);
                    if (!saveResult.ok) {
                        toast.error("Failed to upload progress. Try again.");
                        return;
                    }
                }
            }

            const result = await setProgressSync(next);
            if (!result.ok) {
                toast.error("Failed to update sync setting.");
                return;
            }

            setEnabled(next);
            toast.success(next ? "Progress sync enabled." : "Progress sync disabled.");
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Label htmlFor="sync-toggle" className="cursor-pointer font-medium">
                        Sync progress to server
                    </Label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px]">
                            By default your progress (completed problems, notes, custom lists) is
                            stored only on this device. Enable sync to back it up to our servers
                            and restore it across devices after login.
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Switch
                    id="sync-toggle"
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {enabled
                    ? "Your progress is being saved to the server and will be restored on login."
                    : "Your progress is stored locally on this device only."}
            </p>
        </div>
    );
}
```

- [ ] **Step 2: Check for Switch component**

```bash
ls /Users/zackozack/Projects/lcgrind/src/components/ui/switch.tsx
```

If missing, add it:

```bash
npx shadcn@latest add switch
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "progress-sync-toggle"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/progress-sync-toggle.tsx
git commit -m "feat: ProgressSyncToggle component with tooltip and upload-on-enable"
```

---

## Task 5: Update settings/profile page

**Files:**
- Modify: `src/app/settings/profile/page.tsx`

Add "(Legacy)" to the page title and add the sync section below the profile form.

- [ ] **Step 1: Update the page**

Replace `src/app/settings/profile/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserPen } from "lucide-react";
import { auth } from "~/lib/auth";
import { getMyProfileStatus } from "~/server/actions/grinds/profile-actions";
import { getProgressSync } from "~/server/actions/progress/sync";
import { ProfileForm } from "~/components/auth/profile-form";
import { ProgressSyncToggle } from "~/components/settings/progress-sync-toggle";
import { Card } from "~/components/ui/card";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "Edit profile (Legacy)",
    robots: { index: false },
};

export default async function EditProfilePage() {
    if (!FEATURE_FLAGS.LOGIN) redirect("/");
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");

    const [profile, syncStatus] = await Promise.all([
        getMyProfileStatus(),
        getProgressSync(),
    ]);

    return (
        <div className="w-full max-w-[480px] py-10 px-4 mx-auto flex flex-col gap-8">
            <div className="flex items-center gap-2">
                <UserPen className="size-5" />
                <h1 className="font-bold text-xl">Edit profile</h1>
                <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-1">
                    Legacy
                </span>
            </div>

            <ProfileForm
                initialName={profile.name}
                email={profile.email}
                initialHandle={profile.handle}
            />

            <Card className="p-4 flex flex-col gap-1">
                <p className="font-semibold text-sm mb-2">Progress storage</p>
                <ProgressSyncToggle initialEnabled={syncStatus.enabled} />
            </Card>
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "settings/profile"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/profile/page.tsx
git commit -m "feat: add (Legacy) label and progress sync toggle to settings/profile"
```

---

## Task 6: App-level hydration from DB on login

**Files:**
- Modify: `src/app/providers.tsx`

When sync is enabled, the app should restore DB progress into the Redux store on first load of a session. Strategy: a `ProgressSyncHydrator` client component mounts inside `PersistGate`, checks `sessionStorage` to avoid double-hydration, fetches DB state, writes it back to localStorage, and dispatches `REHYDRATE` to the Redux store.

- [ ] **Step 1: Update providers.tsx**

```tsx
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

// Runs once per browser session. If sync is enabled, fetches DB state and
// hydrates the Redux store before the user interacts with any sheet/list.
function ProgressSyncHydrator() {
    useEffect(() => {
        const SESSION_KEY = "progress_hydrated";
        if (sessionStorage.getItem(SESSION_KEY)) return;

        getProgressSync().then(({ enabled, data }) => {
            if (!enabled || !data || typeof data !== "object") return;

            // Mark hydrated before writing so a render loop can't trigger twice.
            sessionStorage.setItem(SESSION_KEY, "1");

            // Write each slice back as the JSON string redux-persist expects.
            const serialized: Record<string, string> = {};
            for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
                serialized[k] = JSON.stringify(v);
            }
            serialized["_persist"] = JSON.stringify({ version: -1, rehydrated: true });
            localStorage.setItem("persist:leetcode-tracker", JSON.stringify(serialized));

            // Dispatch REHYDRATE so the already-running store picks up the new state.
            store.dispatch({
                type: REHYDRATE,
                key: "leetcode-tracker",
                payload: data,
            });
        }).catch(() => { /* not logged in or network error — stay local */ });
    }, []);

    return null;
}

// Subscribes to store changes and debounce-saves to DB when sync is enabled.
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
function setupSyncSubscriber() {
    store.subscribe(() => {
        const SESSION_KEY = "progress_hydrated";
        if (!sessionStorage.getItem(SESSION_KEY)) return; // only save after hydration confirmed

        if (_saveTimer) clearTimeout(_saveTimer);
        _saveTimer = setTimeout(async () => {
            const { enabled } = await getProgressSync();
            if (!enabled) return;

            // Import saveProgress lazily to avoid server action bundle on cold load.
            const { saveProgress } = await import("~/server/actions/progress/sync");
            const state = store.getState() as Record<string, unknown>;
            await saveProgress(state);
        }, 2000);
    });
}

// Call once at module load — idempotent outside React lifecycle.
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
```

> **Note on `setupSyncSubscriber`:** The subscriber runs at module level (once per page load). The `getProgressSync()` call inside the debounce only fires if the store actually changes, and only checks the DB flag — it does not spam the server. The 2-second debounce means at most one save per 2 seconds of activity.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "providers"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/providers.tsx
git commit -m "feat: hydrate Redux from DB on login when progress sync is enabled"
```

---

## Self-Review

**Spec coverage:**
- [x] All localStorage data (4 Redux slices via persist blob) → Tasks 2, 4, 6
- [x] User opts in (default OFF) → Task 4 `initialEnabled={syncStatus.enabled}`
- [x] Tooltip explaining local-first default → Task 4 TooltipContent
- [x] Toggle in settings (Legacy) → Task 5
- [x] Settings page marked "(Legacy)" → Task 5
- [x] Pencil icon on banner top-right → Task 3
- [x] Only own profile sees pencil → Task 3 `isOwnProfile` guard
- [x] Pencil navigates to new route (`/settings/profile`) → Task 3 `href="/settings/profile"`
- [x] Edit profile doesn't stay separate (pencil is the access point) → Task 3 + Task 5

**Placeholder scan:** No TBD/TODO/placeholder patterns found.

**Type consistency:** `ProgressSyncStatus.data` is `unknown` throughout — Task 2 returns it, Task 6 consumes it with type guard `typeof data !== "object"`. `saveProgress` accepts `unknown` and validates server-side. Consistent.
