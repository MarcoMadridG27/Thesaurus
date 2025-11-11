const nextConfig = {
  reactCompiler: true,
  eslint: {
    ignoreDuringBuilds: true,
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
  compression: true,
  poweredByHeader: false,
}

export default nextConfig
