import { headers } from "next/headers";
import { ShieldAlert } from "lucide-react";
import { auth, isAdminEmail } from "~/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !isAdminEmail(session.user.email)) {
        return (
            <div className="w-full max-w-[800px] py-16 px-4 mx-auto">
                <div className="shadow-shadow border-2 border-border bg-card p-10 flex flex-col items-center gap-3 text-center">
                    <ShieldAlert className="size-10 text-muted-foreground/50" />
                    <h1 className="font-bold text-xl">403 — Not authorized</h1>
                    <p className="text-muted-foreground/70">
                        This area is restricted to maintainers.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
