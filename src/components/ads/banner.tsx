"use client";

import { useEffect } from 'react';

export const AdBanner = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src =
            '//www.highperformanceformat.com/c6b884eaa60b59453fa7daeba089f55f/invoke.js';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <iframe
            src="//www.highperformanceformat.com/c6b884eaa60b59453fa7daeba089f55f/index.html"
            title="Advertisement"
            width="160"
            height="600"
            style={{ border: '0px', margin: '0px', padding: '0px' }}
        />
    );
};

