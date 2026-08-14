import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  assetPrefix: isGitHubActions ? "/ozon671games/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
