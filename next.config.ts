import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'phngappgqhxqjizoxcqo.supabase.co',
        port: '',
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
