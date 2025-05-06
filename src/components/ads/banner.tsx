"use client";

import { useRef } from "react";
import Script from 'next/script';

export const AdBanner = () => {
  const container = useRef<HTMLDivElement>(null);

  const atOptions = {
    key: "93c46aa9fc2321a90646168921d5ff10",
    format: "iframe",
    height: 90,
    width: 728,
    params: {},
  };

  return (
    <div
      ref={container}
      className="flex items-center justify-center w-full"
    >
      <Script
        id="ad-script-468x60"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            var atOptions = ${JSON.stringify(atOptions)};
            (function() {
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = '//www.topcreativeformat.com/' + atOptions.key + '/invoke.js';
              script.async = true;
              script.defer = true;
              container.current.append(script);
            })();
          `,
        }}
      />
    </div>
  );
};
