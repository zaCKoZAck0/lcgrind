"use client";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '~/store';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
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
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}
