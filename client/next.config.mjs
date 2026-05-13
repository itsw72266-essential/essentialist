/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Required wherever `"use cache"` / `cacheLife()` are used (e.g. src/app/page.js).
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Fewer modules to analyze per route = faster dev "Compiling…" (icons / charts / radix).
    optimizePackageImports: [
      "@stripe/stripe-js",
      "lucide-react",
      "react-icons",
      "date-fns",
      "recharts",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
    ],
  },
  // API routes import mongoose; keep it out of the bundler graph where possible.
  serverExternalPackages: ["mongoose"],
  reactStrictMode: true,
  images: {
    unoptimized: true, // 👈 THIS IS THE FIX! It stops Vercel from using your quota.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Changed this to allow all paths
      },
      {
        protocol: "http", // 👈 add this one too
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Changed this to allow all paths
      },
      {
        protocol: 'https',
        hostname: 'd2ati23fc66y9j.cloudfront.net', // Corrected from .js to .net
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
