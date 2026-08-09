import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repository lives below another user-level package-lock.json. Pin the
  // tracing root so local production builds package only this application.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
