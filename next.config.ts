import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // バックエンドAPIのベースURLは NEXT_PUBLIC_API_BASE 環境変数で参照する (lib/apiClient.ts)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'semiproject.s3.us-west-004.backblazeb2.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
