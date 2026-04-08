import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
