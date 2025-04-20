"use client";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from "@vercel/analytics/react"
import { store, persistor } from '~/store';
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
                <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9506252833411117"
                    crossOrigin="anonymous"></Script>
                <PersistGate loading={null} persistor={persistor}>
                    <ReactQueryDevtools initialIsOpen={false} />
                    {children}
                </PersistGate>
            </QueryClientProvider>
        </Provider>
    );
}
