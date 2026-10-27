import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  // Use standalone output for self-hosted Docker deployment.
  // Vercel manages its own bundling and does not require standalone mode.
  ...(isVercel ? {} : { output: "standalone" }),

  // Prevent server-only Node.js packages from being bundled for the browser.
  // These packages use Node.js APIs (crypto, fs, net) and must run only on the server.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pg-pool",
    "bcryptjs",
  ],

  // Turbopack CSS rules (development only, not needed at build/deploy time)
  ...(process.env.NODE_ENV === "development"
    ? {
        turbopack: {
          rules: {
            "*.css": {
              loaders: ["@tailwindcss/turbopack"],
              as: "*.css",
            },
          },
        },
      }
    : {}),
};

export default nextConfig;
