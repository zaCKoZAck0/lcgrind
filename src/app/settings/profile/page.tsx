import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserPen } from "lucide-react";
import { auth } from "~/lib/auth";
import { getMyProfileStatus } from "~/server/actions/grinds/profile-actions";
import { ProfileForm } from "~/components/auth/profile-form";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "Edit profile",
    robots: { index: false },
};

export default async function EditProfilePage() {
    if (!FEATURE_FLAGS.LOGIN) redirect("/");
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");

    const profile = await getMyProfileStatus();

    return (
        <div className="w-full max-w-[480px] py-10 px-4 mx-auto">
            <div className="flex items-center gap-2 mb-8">
                <UserPen className="size-5" />
                <h1 className="font-bold text-xl">Edit profile</h1>
            </div>
            <ProfileForm
                initialName={profile.name}
                email={profile.email}
                initialHandle={profile.handle}
            />
        </div>
    );
}
