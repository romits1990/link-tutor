import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    '@prisma/client', 
    '@prisma/adapter-pg', 
    'pg'
  ],
};

export default nextConfig;