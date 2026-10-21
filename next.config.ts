import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/YOUR_CLOUD_NAME/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "ftp.goit.study",
      },
    ],
  },
};

export default nextConfig;
