"use client";

import React, { useEffect, useRef } from 'react';

export const AdBanner = () => {
    const banner = useRef<HTMLDivElement>(null);

    const atOptions = {
        key: 'c6b884eaa60b59453fa7daeba089f55f',
        format: 'iframe',
        height: 600,
        width: 160,
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
            className="mx-2 my-5 border border-gray-200 justify-center items-center text-white text-center"
            ref={banner}
        />
    );
};

