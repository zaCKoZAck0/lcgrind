import type { ReactNode } from "react";

export function GrindsPageHeader({
    title,
    icon,
    actions,
}: {
    title: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                {icon}
                <h1 className="font-bold text-2xl">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
