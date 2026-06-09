import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['remotion', '@remotion/player'],
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
