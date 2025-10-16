// ENVXX MCP AURA - Base URL configuration for deployment
export const baseURL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000"
    : "https://" +
      (process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_BRANCH_URL || 
          process.env.VERCEL_URL || 
          process.env.RAILWAY_STATIC_URL ||
          process.env.RENDER_EXTERNAL_URL ||
          process.env.NETLIFY_URL ||
          "your-mcp-aura-app.com");
