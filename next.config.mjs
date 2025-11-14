const nextConfig = {
  //reactCompiler: true,

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
}

export default nextConfig
