import type { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";

export function EmptyState({ children }: { children: ReactNode }) {
    return (
        <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
                {children}
            </CardContent>
        </Card>
    );
}
