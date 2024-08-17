/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'books.google.com',
          port: '',  // 必要であればポート番号を指定しますが、通常は空のままで構いません
          pathname: '/books/content/**',  // 画像パスのパターンを指定します
        },
      ],
    },
  };
  
  export default nextConfig;
  