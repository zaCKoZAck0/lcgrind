"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGithubSponsors } from "~/server/actions/github/getGithubSponsors";
import { toast } from "sonner"

export function Sponsors() {
    const { data: sponsors } = useQuery({
        queryKey: ["sponsors"],
        queryFn: () => getGithubSponsors("zaCKoZAck0"),
        staleTime: Infinity,
        gcTime: Infinity,
    })

    useEffect(() => {

        const nodes = sponsors?.data?.user?.sponsors?.nodes;
        if (!nodes || nodes.length === 0) return;

        let idx = 0;

        const interval = setInterval(() => {
            const sponsor = nodes[idx];
            const { login, name } = sponsor;

            toast(`Thank you ${name || login}`, {
                description: `for the sponsor! ❤️`,
            });

            idx = (idx + 1) % nodes.length;
        }, 10000);

        return () => clearInterval(interval);
    }, [sponsors]);
    return <></>
}
