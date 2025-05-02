"use client";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from "@vercel/analytics/react"
import { store, persistor } from '~/store';
import { Toaster } from "~/components/ui/sonner"
import { useEffect, useState } from 'react';
import Script from 'next/script';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    useEffect(() => {
        // Check for theme preference in localStorage
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <Provider store={store}>
            <Analytics />
            <QueryClientProvider client={queryClient}>
                <PersistGate loading={null} persistor={persistor}>
                    <ReactQueryDevtools initialIsOpen={false} />
                    {children}
                    <Toaster />
                </PersistGate>
                <Script type="text/javascript">
	atOptions = {
		'key' : 'c6b884eaa60b59453fa7daeba089f55f',
		'format' : 'iframe',
		'height' : 600,
		'width' : 160,
		'params' : {}
	};
</Script>
<Script type="text/javascript" src="//www.highperformanceformat.com/c6b884eaa60b59453fa7daeba089f55f/invoke.js"></Script>
            </QueryClientProvider>
        </Provider>
    );
}
