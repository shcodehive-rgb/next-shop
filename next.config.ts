import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  productionBrowserSourceMaps: false, // 🛡️ Disables source maps (hides code in devtools)
  poweredByHeader: false, // 🛡️ Hides "X-Powered-By: Next.js" header
};

export default nextConfig;
