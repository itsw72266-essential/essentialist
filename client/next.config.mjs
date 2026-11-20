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
  // Strict Mode doubles renders in dev; keep on in production only.
  reactStrictMode: process.env.NODE_ENV === "production",
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

// NOTE: No Content-Security-Policy header is set here. This app loads
// Stripe.js/Checkout, Google Tag Manager/Analytics, jsdelivr-hosted
// scripts, and Cloudinary-hosted images from several third-party
// origins. A CSP needs to be hand-curated against that exact set of
// origins (script-src/connect-src/frame-src for Stripe, img-src for
// Cloudinary/CloudFront, script-src/connect-src for GTM/GA) — adding a
// wrong or incomplete one here would silently break checkout. Add it
// deliberately, tested end-to-end against a real checkout flow, rather
// than guessing it in a generic security pass.
nextConfig.headers = async () => [
  {
    // Everything except the animated hero-ad asset keeps the strict DENY
    // clickjacking protection below; that one static, data-free promo
    // page is embedded same-origin in the homepage hero carousel, so it
    // gets SAMEORIGIN instead (see the second rule).
    source: "/((?!assets/essentialist_makeup_animated_ad\\.html).*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ],
  },
  {
    source: "/assets/essentialist_makeup_animated_ad.html",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ],
  },
];

export default nextConfig;
