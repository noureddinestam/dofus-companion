import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/noureddinestam/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/contribute",
        destination: "/retours",
        permanent: true,
      },
      {
        source: "/contribuer",
        destination: "/retours",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
