import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubActions ? "/ozon671games" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
