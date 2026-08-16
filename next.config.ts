import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // バックエンドAPIのベースURLは NEXT_PUBLIC_API_BASE 環境変数で参照する (lib/apiClient.ts)
  // 画像最適化を使う場合、外部ドメインはここに追加する
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'semiproject.s3.us-west-004.backblazeb2.com',
      },
    ],
  },
}

export default nextConfig
