import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  // Use standalone output for self-hosted Docker deployment.
  // Vercel manages its own bundling and does not require standalone mode.
  ...(isVercel ? {} : { output: "standalone" }),
  // Prevent Turbopack from bundling server-only Node.js packages for the browser.
  // These packages use Node.js APIs (crypto, fs, net) and must run only on the server.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pg-pool",
    "bcryptjs",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
