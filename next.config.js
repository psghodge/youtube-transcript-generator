/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add polyfills for Firebase dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        url: require.resolve("url/"),
        zlib: require.resolve("browserify-zlib"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        assert: require.resolve("assert/"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        "process/browser": require.resolve("process/browser"),
      };
    }
    return config;
  },
  // Enable static exports
  output: "standalone",
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
