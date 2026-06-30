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
      </div>

      <ProfileForm
        initialName={profile.name}
        email={profile.email}
        initialHandle={profile.handle}
      />

      <Card className="p-4 flex flex-col gap-1">
        <ProgressSyncToggle initialEnabled={syncStatus.enabled} initialLastSyncedAt={syncStatus.lastSyncedAt} />
      </Card>
    </div>
  );
}
