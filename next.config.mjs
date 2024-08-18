/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'books.google.com',
          port: '',  // 必要であればポート番号を指定しますが、通常は空のままで構いません
          pathname: '/books/**',  // より広い範囲をカバーする新しい設定
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',  // 通常は空で大丈夫です
          pathname: '/a/**',  // パスの設定
        },
        {
          protocol: 'https',
          hostname: 'www.googleapis.com',
          port: '',  // 通常は空で大丈夫です
          pathname: '/books/v1/volumes/**',  // パスの設定
        },
      ],
    },
  };
  
  export default nextConfig;
  