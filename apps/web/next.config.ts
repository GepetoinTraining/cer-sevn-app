/** @type {import('next').NextConfig} */
const nextConfig = {
  // This ensures that pnpm's symlinked workspace packages are
  // correctly transpiled by Next.js
  transpilePackages: ['@prisma/client'],
};

export default nextConfig;
