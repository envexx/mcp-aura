// ENVXX MCP AURA - Next.js configuration for Smart Chatbot Onchain
import type { NextConfig } from "next";
import { baseURL } from "./baseUrl";

const nextConfig: NextConfig = {
  assetPrefix: baseURL, // Ensures assets load correctly in ChatGPT iframe
};

export default nextConfig;
