"use client";

import { useEffect, useRef } from 'react';

export const AdBanner = () => {
    const banner = useRef<HTMLDivElement>(null);

    const atOptions = {
        key: '93c46aa9fc2321a90646168921d5ff10',
        format: 'iframe',
        height: 90,
        width: 728,
        params: {},
    };

    useEffect(() => {
        if (banner.current && !banner.current.firstChild) {
            const conf = document.createElement('script');
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`;
            conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;

            banner.current.append(conf);
            banner.current.append(script);
        }
    }, [atOptions]); // Added atOptions to the dependency array

    return (
        <div
            className="mx-2 my-5 border border-gray-200 justify-center items-center text-white text-center w-full overflow-hidden"
            ref={banner}
        />
    );
};

