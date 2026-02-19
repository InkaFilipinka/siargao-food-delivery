/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.png", permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "siargaodelivery.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
