/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export
  images: {
    unoptimized: true, // disables Image Optimization API
  },
};

export default nextConfig;