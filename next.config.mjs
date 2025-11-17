const nextConfig = {
  //reactCompiler: true,

  // 🔥 DESACTIVAMOS TURBOPACK (causante del problema con env vars en Amplify)
  experimental: {
    turbo: false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },

  poweredByHeader: false,
};

export default nextConfig;
