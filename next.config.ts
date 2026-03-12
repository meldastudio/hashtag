import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  transpilePackages: ['pg'],
};

export default nextConfig;
