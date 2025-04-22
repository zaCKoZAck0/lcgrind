import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.logo.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "z47zz7i0co.ufs.sh",
      },
    ],
  }
};

export default nextConfig;
