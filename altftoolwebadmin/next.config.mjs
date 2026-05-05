import { withSecurityHeaders } from "@altftool/core/next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: workspaceRoot,
  },

  images:{
    remotePatterns:[
      {
        protocol: 'https',
        hostname: "firebasestorage.googleapis.com",
      }
    ]
  }
};

export default withSecurityHeaders(nextConfig, "admin");
